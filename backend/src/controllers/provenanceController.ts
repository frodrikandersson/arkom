import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { provenanceAnalysis, artistVerification } from '../config/schema.js';
import { eq } from 'drizzle-orm';
import {
  extractMetadata,
  analyzeMetadata,
  checkArtistVerification,
  calculateFinalScore,
} from '../services/provenanceAnalysis.js';
import { analyzeImageWithHiveAi } from '../services/detectAIService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';


/**
 * POST /api/provenance/analyze
 * Analyze an image for AI detection (admin use - manual portfolioId input)
 */
export const analyzeArtwork = asyncHandler(async (req: Request, res: Response) => {
  const { portfolioId, imageUrl, userId } = req.body;

  if (!imageUrl) {
    throw new AppError(400, 'imageUrl is required');
  }

  // Check if analysis already exists for this portfolio (cache for 30 days)
  if (portfolioId) {
    const existingAnalysis = await db
      .select()
      .from(provenanceAnalysis)
      .where(eq(provenanceAnalysis.portfolioId, parseInt(portfolioId)))
      .limit(1);

    if (existingAnalysis.length > 0) {
      const analysis = existingAnalysis[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Return cached result if less than 30 days old
      if (analysis.analyzedAt > thirtyDaysAgo) {
        res.json({
          analysis: {
            ...analysis,
            metadataDetails: analysis.metadataDetails ? JSON.parse(analysis.metadataDetails) : null,
            behavioralDetails: analysis.behavioralDetails ? JSON.parse(analysis.behavioralDetails) : null,
            aiDetectionDetails: analysis.aiDetectionDetails ? JSON.parse(analysis.aiDetectionDetails) : null,
          },
          cached: true,
        });
        return;
      }
    }
  }

  // Download image from R2 using fetch
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }
  
  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  // Phase 1: Metadata analysis
  const metadata = await extractMetadata(imageBuffer);
  const metadataAnalysis = analyzeMetadata(metadata);

  // Check if user is verified artist
  const isVerifiedArtist = userId ? await checkArtistVerification(userId) : false;

  // Phase 2: Visual AI detection (Hive AI)
  let visualAiScore = null;
  let aiDetectionDetails = null;
  try {
      const hiveResult = await analyzeImageWithHiveAi(imageBuffer, imageUrl.split('/').pop() || 'image.png');
      visualAiScore = hiveResult.score;
      aiDetectionDetails = JSON.stringify(hiveResult.details);
  } catch (err) {
      console.error('Hive AI analysis failed:', err);
      // Continue with null score - don't fail entire analysis
  }

  // Phase 3: File analysis, behavioral, community (not implemented yet)
  const fileAnalysisScore = null;
  const behavioralScore = null;
  const communityScore = null;

  // Calculate final score
  const { finalScore, verdict, confidenceLevel } = calculateFinalScore(
    metadataAnalysis.score,
    fileAnalysisScore,
    visualAiScore,
    behavioralScore,
    communityScore,
    isVerifiedArtist
  );

  // Determine if should be flagged (auto-flag if score < 30 and high confidence)
  const shouldFlag = finalScore < 30 && confidenceLevel === 'high';

  // Save or update analysis
  const analysisData = {
    portfolioId: portfolioId ? parseInt(portfolioId) : null,
    analyzedAt: new Date(),
    metadataScore: metadataAnalysis.score,
    fileAnalysisScore,
    visualAiScore,
    behavioralScore,
    communityScore,
    finalScore,
    confidenceLevel,
    verdict,
    metadataDetails: JSON.stringify(metadataAnalysis.details),
    behavioralDetails: null,
    aiDetectionDetails,
    isFlagged: shouldFlag,
    isAppealed: false,
    appealStatus: null,
  };

  let savedAnalysis;
  if (portfolioId) {
    const existingAnalysis = await db
      .select()
      .from(provenanceAnalysis)
      .where(eq(provenanceAnalysis.portfolioId, parseInt(portfolioId)))
      .limit(1);

    if (existingAnalysis.length > 0) {
      // Update existing
      await db
        .update(provenanceAnalysis)
        .set(analysisData)
        .where(eq(provenanceAnalysis.id, existingAnalysis[0].id));
      
      savedAnalysis = { ...analysisData, id: existingAnalysis[0].id };
    } else {
      // Insert new
      const inserted = await db
        .insert(provenanceAnalysis)
        .values(analysisData)
        .returning();
      
      savedAnalysis = inserted[0];
    }
  } else {
    // No portfolioId - just insert without linking
    const inserted = await db
      .insert(provenanceAnalysis)
      .values(analysisData)
      .returning();
    
    savedAnalysis = inserted[0];
  }

  res.json({
    analysis: {
      ...savedAnalysis,
      metadataDetails: metadataAnalysis.details,
      behavioralDetails: null,
      aiDetectionDetails: aiDetectionDetails ? JSON.parse(aiDetectionDetails) : null,
    },
    cached: false,
  });
});


/**
 * GET /api/provenance/results/:portfolioId
 * Get existing analysis results for a portfolio
 */
export const getAnalysisResults = asyncHandler(async (req: Request, res: Response) => {
  const { portfolioId } = req.params;

  const results = await db
    .select()
    .from(provenanceAnalysis)
    .where(eq(provenanceAnalysis.portfolioId, parseInt(portfolioId)))
    .limit(1);

  if (results.length === 0) {
    throw new AppError(404, 'No analysis found for this portfolio');
  }

  const analysis = results[0];

  res.json({
    analysis: {
      ...analysis,
      metadataDetails: analysis.metadataDetails ? JSON.parse(analysis.metadataDetails) : null,
      behavioralDetails: analysis.behavioralDetails ? JSON.parse(analysis.behavioralDetails) : null,
      aiDetectionDetails: analysis.aiDetectionDetails ? JSON.parse(analysis.aiDetectionDetails) : null,
    },
  });
});

/**
 * POST /api/provenance/appeal/:analysisId
 * Submit an appeal for a flagged artwork
 */
export const submitAppeal = asyncHandler(async (req: Request, res: Response) => {
  const { analysisId } = req.params;
  const { userId, appealText, supportingEvidenceUrl } = req.body;

  if (!userId || !appealText) {
    throw new AppError(400, 'userId and appealText are required');
  }

  // Verify analysis exists
  const analysisResult = await db
    .select()
    .from(provenanceAnalysis)
    .where(eq(provenanceAnalysis.id, parseInt(analysisId)))
    .limit(1);

  if (analysisResult.length === 0) {
    throw new AppError(404, 'Analysis not found');
  }

  // Create appeal (will be implemented with provenanceAppeals table)
  // For now, just mark as appealed
  await db
    .update(provenanceAnalysis)
    .set({
      isAppealed: true,
      appealStatus: 'pending',
    })
    .where(eq(provenanceAnalysis.id, parseInt(analysisId)));

  res.json({ success: true, message: 'Appeal submitted successfully' });
});