import exifr from 'exifr';

// Types for metadata analysis
interface MetadataAnalysisResult {
  score: number; // 0-100
  details: {
    hasSoftwareTag: boolean;
    hasCreatorTool: boolean;
    hasColorProfile: boolean;
    hasEditHistory: boolean;
    hasXmpMetadata: boolean;
    timestampConsistency: 'consistent' | 'suspicious' | 'missing';
    suspiciousFlags: string[];
    legitimateSoftware: string | null;
  };
  confidence: 'low' | 'medium' | 'high';
}

// Legitimate digital art software signatures
const LEGITIMATE_SOFTWARE = [
  'Adobe Photoshop',
  'Clip Studio Paint',
  'Procreate',
  'Krita',
  'GIMP',
  'Affinity Photo',
  'Affinity Designer',
  'Corel Painter',
  'Paint Tool SAI',
  'MediBang Paint',
  'Rebelle',
];

// AI generation tool signatures (known red flags)
const AI_TOOL_SIGNATURES = [
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'NovelAI',
  'leonardo.ai',
];

/**
 * Extract metadata from image buffer
 */
export async function extractMetadata(fileBuffer: Buffer): Promise<any> {
  try {
    // Extract all available metadata
    const metadata = await exifr.parse(fileBuffer, {
      // EXIF tags
      exif: true,
      // XMP tags (Adobe metadata)
      xmp: true,
      // IPTC tags
      iptc: true,
      // ICC color profile
      icc: true,
      // TIFF tags
      tiff: true,
      // Parse everything
      mergeOutput: true,
    });

    return metadata || {};
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return {};
  }
}

/**
 * Analyze metadata for provenance indicators
 */
export function analyzeMetadata(metadata: any): MetadataAnalysisResult {
  const details = {
    hasSoftwareTag: false,
    hasCreatorTool: false,
    hasColorProfile: false,
    hasEditHistory: false,
    hasXmpMetadata: false,
    timestampConsistency: 'missing' as 'consistent' | 'suspicious' | 'missing',
    suspiciousFlags: [] as string[],
    legitimateSoftware: null as string | null,
  };

  let score = 0; // Start at 0, add points for legitimate indicators

  // Check 1: Software tag
  if (metadata.Software) {
    details.hasSoftwareTag = true;
    
    // Check if it's legitimate software
    const matchedSoftware = LEGITIMATE_SOFTWARE.find(sw => 
      metadata.Software.includes(sw)
    );
    
    if (matchedSoftware) {
      details.legitimateSoftware = matchedSoftware;
      score += 25; // Strong positive signal
    }
    
    // Check for AI tool signatures (red flag)
    const hasAISignature = AI_TOOL_SIGNATURES.some(ai => 
      metadata.Software.includes(ai)
    );
    
    if (hasAISignature) {
      details.suspiciousFlags.push('AI tool signature detected');
      score -= 30; // Strong negative signal
    }
  } else {
    details.suspiciousFlags.push('No software tag');
    score -= 10;
  }

  // Check 2: XMP Creator Tool
  if (metadata.CreatorTool || metadata['xmp:CreatorTool']) {
    details.hasCreatorTool = true;
    details.hasXmpMetadata = true;
    score += 15;
  } else {
    details.suspiciousFlags.push('No XMP creator tool');
  }

  // Check 3: Color profile
  if (metadata.ColorSpace || metadata.ICCProfile || metadata['photoshop:ICCProfile']) {
    details.hasColorProfile = true;
    score += 10;
  } else {
    details.suspiciousFlags.push('No color profile');
  }

  // Check 4: Edit history (if present, strong positive signal)
  if (metadata.History || metadata['photoshop:History']) {
    details.hasEditHistory = true;
    score += 20; // Very strong positive signal
  }

  // Check 5: Timestamp consistency
  const createDate = metadata.CreateDate || metadata.DateTimeOriginal;
  const modifyDate = metadata.ModifyDate;
  
  if (createDate && modifyDate) {
    const create = new Date(createDate);
    const modify = new Date(modifyDate);
    
    // Red flag: ModifyDate before CreateDate
    if (modify < create) {
      details.timestampConsistency = 'suspicious';
      details.suspiciousFlags.push('ModifyDate before CreateDate');
      score -= 15;
    }
    // Red flag: Timestamps identical (no editing time for "art")
    else if (create.getTime() === modify.getTime()) {
      details.timestampConsistency = 'suspicious';
      details.suspiciousFlags.push('No editing time between creation and modification');
      score -= 5;
    }
    // Red flag: Suspiciously round timestamps
    else if (create.getSeconds() === 0 && create.getMilliseconds() === 0 &&
             modify.getSeconds() === 0 && modify.getMilliseconds() === 0) {
      details.timestampConsistency = 'suspicious';
      details.suspiciousFlags.push('Suspiciously round timestamps');
      score -= 5;
    }
    else {
      details.timestampConsistency = 'consistent';
      score += 10;
    }
  } else {
    details.timestampConsistency = 'missing';
    details.suspiciousFlags.push('Missing timestamps');
  }

  // Check 6: Camera metadata on "digital art" (suspicious)
  if (metadata.Model || metadata.LensModel || metadata.FocalLength) {
    details.suspiciousFlags.push('Camera metadata on digital art');
    score -= 10;
  }

  // Check 7: Perfect square dimensions (common in AI)
  const width = metadata.ImageWidth || metadata.PixelXDimension;
  const height = metadata.ImageHeight || metadata.PixelYDimension;
  
  if (width === height && [512, 768, 1024, 2048, 4096].includes(width)) {
    details.suspiciousFlags.push(`Perfect square AI-standard resolution: ${width}x${height}`);
    score -= 5;
  }

  // Normalize score to 0-100 range
  score = Math.max(0, Math.min(100, score + 50)); // +50 to center at 50 for neutral

  // Determine confidence level
  let confidence: 'low' | 'medium' | 'high';
  if (details.hasEditHistory || details.legitimateSoftware) {
    confidence = 'high';
  } else if (details.hasSoftwareTag || details.hasCreatorTool) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    score,
    details,
    confidence,
  };
}

/**
 * Check for artist verification (Phase 1: just a stub, will implement later)
 */
export async function checkArtistVerification(userId: string): Promise<boolean> {
  // TODO: Query artistVerification table
  // For now, return false
  return false;
}

/**
 * Calculate final provenance score and verdict
 */
export function calculateFinalScore(
  metadataScore: number,
  fileAnalysisScore: number | null,
  visualAiScore: number | null,
  behavioralScore: number | null,
  communityScore: number | null,
  isVerifiedArtist: boolean
): {
  finalScore: number;
  verdict: 'verified_artist' | 'likely_legitimate' | 'uncertain' | 'likely_ai';
  confidenceLevel: 'low' | 'medium' | 'high' | 'very_high';
} {
  // Verified artist override
  if (isVerifiedArtist) {
    return {
      finalScore: 100,
      verdict: 'verified_artist',
      confidenceLevel: 'very_high',
    };
  }

  // Weighted scoring (Phase 1: only metadata, others will be null)
  const weights = {
    metadata: 0.4,      // 40% (higher in Phase 1 since it's all we have)
    fileAnalysis: 0.2,  // 20%
    visualAi: 0.3,      // 30%
    behavioral: 0.05,   // 5%
    community: 0.05,    // 5%
  };

  let totalWeight = 0;
  let weightedSum = 0;

  // Metadata (always present in Phase 1)
  weightedSum += metadataScore * weights.metadata;
  totalWeight += weights.metadata;

  // File analysis (Phase 2)
  if (fileAnalysisScore !== null) {
    weightedSum += fileAnalysisScore * weights.fileAnalysis;
    totalWeight += weights.fileAnalysis;
  }

  // Visual AI (Phase 2)
  if (visualAiScore !== null) {
    weightedSum += visualAiScore * weights.visualAi;
    totalWeight += weights.visualAi;
  }

  // Behavioral (Phase 2)
  if (behavioralScore !== null) {
    weightedSum += behavioralScore * weights.behavioral;
    totalWeight += weights.behavioral;
  }

  // Community (Phase 3)
  if (communityScore !== null) {
    weightedSum += communityScore * weights.community;
    totalWeight += weights.community;
  }

  // Normalize to 0-100
  const finalScore = Math.round(weightedSum / totalWeight);

  // Determine verdict
  let verdict: 'likely_legitimate' | 'uncertain' | 'likely_ai';
  let confidenceLevel: 'low' | 'medium' | 'high';

  if (finalScore >= 70) {
    verdict = 'likely_legitimate';
    confidenceLevel = finalScore >= 85 ? 'high' : 'medium';
  } else if (finalScore >= 40) {
    verdict = 'uncertain';
    confidenceLevel = 'medium';
  } else {
    verdict = 'likely_ai';
    confidenceLevel = finalScore <= 25 ? 'high' : 'medium';
  }

  return { finalScore, verdict, confidenceLevel };
}
