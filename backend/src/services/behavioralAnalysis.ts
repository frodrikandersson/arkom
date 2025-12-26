import { db } from '../config/db.js';
import { userUploadBehavior, artistVerification } from '../config/schema.js';
import { eq, and } from 'drizzle-orm';

export interface BehavioralAnalysisResult {
  score: number; // 0-100 (higher = more trustworthy)
  shouldTriggerAiDetection: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    totalUploads: number;
    uploadsLastHour: number;
    uploadsLastDay: number;
    pasteRatio: number; // 0-1
    isVerifiedArtist: boolean;
    suspiciousFlags: string[];
    accountAge?: number; // Will add this when user data is available
  };
}

/**
 * Analyzes user's upload behavior using aggregate statistics
 * Works with existing userUploadBehavior schema
 */
export async function analyzeBehavior(
    userId: number,
    currentUploadMethod: 'file' | 'paste',
    currentFileSize: number
): Promise<BehavioralAnalysisResult> {
    // Get user's aggregate upload stats
    const behaviorData = await db
        .select()
        .from(userUploadBehavior)
        .where(eq(userUploadBehavior.userId, userId.toString()))
        .limit(1);

    // Check if verified artist (if record exists, they're verified)
    const verification = await db
        .select()
        .from(artistVerification)
        .where(eq(artistVerification.userId, userId.toString()))
        .limit(1);

    const isVerifiedArtist = verification.length > 0;


  // Use aggregate stats (default to 0 if no data yet)
  const stats = behaviorData.length > 0 ? behaviorData[0] : {
    totalUploads: 0,
    uploadsLastHour: 0,
    uploadsLastDay: 0,
    pasteUploadCount: 0,
    fileUploadCount: 0,
  };

  const totalUploads = stats.totalUploads || 0;
  const uploadsLastHour = stats.uploadsLastHour || 0;
  const uploadsLastDay = stats.uploadsLastDay || 0;
  const pasteCount = stats.pasteUploadCount || 0;
  const fileCount = stats.fileUploadCount || 0;

  const pasteRatio = (pasteCount + fileCount) > 0 
    ? pasteCount / (pasteCount + fileCount) 
    : 0;

  // === Scoring ===
  
  let score = 50; // Start neutral
  const suspiciousFlags: string[] = [];

  // Upload velocity
  if (uploadsLastHour >= 10) {
    score -= 30;
    suspiciousFlags.push(`Extreme velocity: ${uploadsLastHour}/hour`);
  } else if (uploadsLastHour >= 5) {
    score -= 15;
    suspiciousFlags.push(`High velocity: ${uploadsLastHour}/hour`);
  }

  if (uploadsLastDay >= 50) {
    score -= 25;
    suspiciousFlags.push(`Mass upload: ${uploadsLastDay}/day`);
  } else if (uploadsLastDay >= 20) {
    score -= 10;
    suspiciousFlags.push(`High volume: ${uploadsLastDay}/day`);
  }

  // Paste ratio
  if (pasteRatio >= 0.9 && totalUploads >= 10) {
    score -= 15;
    suspiciousFlags.push(`High paste ratio: ${(pasteRatio * 100).toFixed(0)}%`);
  }

  // Long-term consistency bonus
  if (totalUploads >= 50) {
    score += 10;
  }

  // Verified artist bonus
  if (isVerifiedArtist) {
    score += 30;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // === Trigger Decision ===
  
  let riskLevel: 'low' | 'medium' | 'high';
  let shouldTriggerAiDetection = false;

  if (score >= 70) {
    riskLevel = 'low';
    shouldTriggerAiDetection = false;
  } else if (score >= 40) {
    riskLevel = 'medium';
    shouldTriggerAiDetection = Math.random() < 0.2; // 20% sampling
  } else {
    riskLevel = 'high';
    shouldTriggerAiDetection = true;
  }

  // Override: First 3 uploads always checked
  if (totalUploads < 3) {
    shouldTriggerAiDetection = true;
    suspiciousFlags.push('First few uploads');
  }

  // Override: Verified artists with good score skip detection
  if (isVerifiedArtist && score >= 50) {
    shouldTriggerAiDetection = false;
  }

  return {
    score,
    shouldTriggerAiDetection,
    riskLevel,
    details: {
      totalUploads,
      uploadsLastHour,
      uploadsLastDay,
      pasteRatio,
      isVerifiedArtist,
      suspiciousFlags,
    },
  };
}

/**
 * Updates aggregate upload statistics for a user
 * Call this after each artwork upload
 */
export async function updateUploadStats(
  userId: number,
  uploadMethod: 'file' | 'paste'
): Promise<void> {
  const userIdStr = userId.toString();
  
  // Get current stats
  const existing = await db
    .select()
    .from(userUploadBehavior)
    .where(eq(userUploadBehavior.userId, userIdStr))
    .limit(1);

  const now = new Date();

  if (existing.length === 0) {
    // Create new record
    await db.insert(userUploadBehavior).values({
      userId: userIdStr,
      totalUploads: 1,
      uploadsLastHour: 1,
      uploadsLastDay: 1,
      pasteUploadCount: uploadMethod === 'paste' ? 1 : 0,
      fileUploadCount: uploadMethod === 'file' ? 1 : 0,
      lastUploadAt: now,
      updatedAt: now,
    });
  } else {
    // Update existing record
    const stats = existing[0];
    const lastUpload = stats.lastUploadAt || new Date(0);
    
    // Calculate time-based counters
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Reset hourly counter if last upload was > 1 hour ago
    const newUploadsLastHour = lastUpload > hourAgo 
      ? (stats.uploadsLastHour || 0) + 1 
      : 1;
    
    // Reset daily counter if last upload was > 24 hours ago
    const newUploadsLastDay = lastUpload > dayAgo 
      ? (stats.uploadsLastDay || 0) + 1 
      : 1;

    await db
      .update(userUploadBehavior)
      .set({
        totalUploads: (stats.totalUploads || 0) + 1,
        uploadsLastHour: newUploadsLastHour,
        uploadsLastDay: newUploadsLastDay,
        pasteUploadCount: uploadMethod === 'paste' 
          ? (stats.pasteUploadCount || 0) + 1 
          : stats.pasteUploadCount,
        fileUploadCount: uploadMethod === 'file' 
          ? (stats.fileUploadCount || 0) + 1 
          : stats.fileUploadCount,
        lastUploadAt: now,
        updatedAt: now,
      })
      .where(eq(userUploadBehavior.userId, userIdStr));
  }
}
