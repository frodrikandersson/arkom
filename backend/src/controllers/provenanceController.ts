import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { artworks, provenanceAnalysis, artistVerification } from '../config/schema.js';
import { eq } from 'drizzle-orm';
import {
  extractMetadata,
  analyzeMetadata,
  checkArtistVerification,
  calculateFinalScore,
} from '../services/provenanceAnalysis.js';

/**
 * POST /api/provenance/analyze/:artworkId
 * Analyze an artwork for AI detection
 */
export const analyzeArtwork = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;

    // Get artwork from database
    const artworkResult = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, parseInt(artworkId)))
      .limit(1);

    if (artworkResult.length === 0) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }

    const artwork = artworkResult[0];

    // Check if analysis already exists (cache for 30 days)
    const existingAnalysis = await db
      .select()
      .from(provenanceAnalysis)
      .where(eq(provenanceAnalysis.artworkId, parseInt(artworkId)))
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

    // Download image from R2 using fetch
    const imageResponse = await fetch(artwork.fileUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Phase 1: Metadata analysis
    const metadata = await extractMetadata(imageBuffer);
    const metadataAnalysis = analyzeMetadata(metadata);

    // Check if user is verified artist
    const isVerifiedArtist = await checkArtistVerification(artwork.userId);

    // Phase 2 & 3: Not implemented yet (will be null)
    const fileAnalysisScore = null;
    const visualAiScore = null;
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
      artworkId: parseInt(artworkId),
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
      aiDetectionDetails: null,
      isFlagged: shouldFlag,
      isAppealed: false,
      appealStatus: null,
    };

    let savedAnalysis;
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

    res.json({
      analysis: {
        ...savedAnalysis,
        metadataDetails: metadataAnalysis.details,
        behavioralDetails: null,
        aiDetectionDetails: null,
      },
      cached: false,
    });
  } catch (error) {
    console.error('Provenance analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze artwork' });
  }
};


/**
 * GET /api/provenance/results/:artworkId
 * Get existing analysis results for an artwork
 */
export const getAnalysisResults = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;

    const results = await db
      .select()
      .from(provenanceAnalysis)
      .where(eq(provenanceAnalysis.artworkId, parseInt(artworkId)))
      .limit(1);

    if (results.length === 0) {
      res.status(404).json({ error: 'No analysis found for this artwork' });
      return;
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
  } catch (error) {
    console.error('Get analysis results error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
};

/**
 * POST /api/provenance/appeal/:analysisId
 * Submit an appeal for a flagged artwork
 */
export const submitAppeal = async (req: Request, res: Response) => {
  try {
    const { analysisId } = req.params;
    const { userId, appealText, supportingEvidenceUrl } = req.body;

    if (!userId || !appealText) {
      res.status(400).json({ error: 'userId and appealText are required' });
      return;
    }

    // Verify analysis exists
    const analysisResult = await db
      .select()
      .from(provenanceAnalysis)
      .where(eq(provenanceAnalysis.id, parseInt(analysisId)))
      .limit(1);

    if (analysisResult.length === 0) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
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
  } catch (error) {
    console.error('Submit appeal error:', error);
    res.status(500).json({ error: 'Failed to submit appeal' });
  }
};
