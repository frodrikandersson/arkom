import sharp from 'sharp';

const ILLUMINARTY_API_KEY = process.env.ILLUMINARTY_API_KEY || '';
const ILLUMINARTY_ENDPOINT = 'https://api.illuminarty.ai/v1/image/classify';

interface IlluminartyResponse {
  data: {
    probability: number; // 0-1 (AI probability)
    attribution: {
      dalle2: number;
      human: number;
      midjourney: number;
      stablediffusion: number;
    };
  };
  status: 'success' | 'error';
}


export interface VisualAiAnalysisResult {
  score: number; // 0-100 (higher = more likely legitimate)
  confidence: 'low' | 'medium' | 'high';
  details: {
    aiGeneratedScore: number; // AI probability (0-1)
    topClasses: Array<{ class: string; score: number }>;
    detectedPatterns: string[];
    rawResponse?: any;
  };
}

/**
 * Analyzes an image using Illuminarty AI detection API
 * Returns a score where:
 * - 0-30 = Likely AI-generated (high confidence)
 * - 31-60 = Uncertain (medium confidence)
 * - 61-100 = Likely human-created (high confidence)
 */
export async function analyzeImageWithHiveAi(
  imageBuffer: Buffer,
  filename: string
): Promise<VisualAiAnalysisResult> {
  if (!ILLUMINARTY_API_KEY) {
    console.warn('ILLUMINARTY_API_KEY not set, skipping AI visual detection');
    return {
      score: 50,
      confidence: 'low',
      details: {
        aiGeneratedScore: 0.5,
        topClasses: [],
        detectedPatterns: ['API key not configured'],
      },
    };
  }
  
  try {
    // Resize large images to max 2048px on longest side to stay under API limits
    let processedBuffer = imageBuffer;
    
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // If image is larger than 2048px on either dimension, resize it
    if (metadata.width && metadata.height && (metadata.width > 2048 || metadata.height > 2048)) {
      console.log(`Resizing image from ${metadata.width}x${metadata.height} for Illuminarty API`);
      
      processedBuffer = await image
        .resize(2048, 2048, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    // Create FormData with processed image
    const blob = new Blob([new Uint8Array(processedBuffer)]);
    const form = new FormData();
    form.append('file', blob, filename);

    // Call Illuminarty API
    const response = await fetch(ILLUMINARTY_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-Key': ILLUMINARTY_API_KEY,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Illuminarty API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as IlluminartyResponse;

    // Check for success status
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid Illuminarty response format');
    }

    // Extract AI probability from response
    const aiGeneratedScore = data.data.probability; // This is the AI probability (0-1)
    const humanScore = data.data.attribution.human;


    // Calculate legitimacy score (inverse of AI probability)
    // Higher score = more likely human-created
    let score = Math.round((1 - aiGeneratedScore) * 100);

    // Confidence based on how decisive the AI probability is
    let confidence: 'low' | 'medium' | 'high';
    if (aiGeneratedScore < 0.3 || aiGeneratedScore > 0.7) {
      confidence = 'high'; // Very decisive (clearly AI or clearly human)
    } else if (aiGeneratedScore < 0.4 || aiGeneratedScore > 0.6) {
      confidence = 'medium'; // Moderately decisive
    } else {
      confidence = 'low'; // Uncertain (around 50/50)
    }


    // Build top classes array with attribution breakdown
    const topClasses = [
      { class: 'ai_generated', score: aiGeneratedScore },
      { class: 'human_created', score: humanScore },
      { class: 'stable_diffusion', score: data.data.attribution.stablediffusion },
      { class: 'dalle2', score: data.data.attribution.dalle2 },
      { class: 'midjourney', score: data.data.attribution.midjourney },
    ].sort((a, b) => b.score - a.score);


    // Extract detected patterns
    const detectedPatterns: string[] = [];
    
    if (aiGeneratedScore > 0.7) {
      detectedPatterns.push(`High AI probability: ${(aiGeneratedScore * 100).toFixed(1)}%`);
      
      // Show which AI model is most likely
      const topAI = Math.max(
        data.data.attribution.stablediffusion,
        data.data.attribution.dalle2,
        data.data.attribution.midjourney
      );
      
      if (data.data.attribution.stablediffusion === topAI && topAI > 0.3) {
        detectedPatterns.push(`Likely Stable Diffusion: ${(data.data.attribution.stablediffusion * 100).toFixed(1)}%`);
      } else if (data.data.attribution.dalle2 === topAI && topAI > 0.3) {
        detectedPatterns.push(`Likely DALL-E 2: ${(data.data.attribution.dalle2 * 100).toFixed(1)}%`);
      } else if (data.data.attribution.midjourney === topAI && topAI > 0.3) {
        detectedPatterns.push(`Likely Midjourney: ${(data.data.attribution.midjourney * 100).toFixed(1)}%`);
      }
    } else if (aiGeneratedScore > 0.5) {
      detectedPatterns.push(`Moderate AI probability: ${(aiGeneratedScore * 100).toFixed(1)}%`);
    } else {
      detectedPatterns.push(`Likely human-created: ${(humanScore * 100).toFixed(1)}%`);
    }

    return {
      score,
      confidence,
      details: {
        aiGeneratedScore,
        topClasses,
        detectedPatterns,
        rawResponse: data,
      },
    };
  } catch (error) {
    console.error('Illuminarty AI analysis failed:', error);

    return {
      score: 50,
      confidence: 'low',
      details: {
        aiGeneratedScore: 0.5,
        topClasses: [],
        detectedPatterns: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      },
    };
  }
}
