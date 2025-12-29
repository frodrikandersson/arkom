import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { 
  portfolios, 
  portfolioMedia, 
  portfolioSensitiveContent,
  sensitiveContentTypes,
} from '../config/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { uploadToR2, deleteFromR2 } from '../config/r2.js';
import { validateYouTubeUrl } from '../config/fileConstraints.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Create new portfolio
export const createPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    title,
    description,
    tags,
    status,
    linkedToCommission,
    commissionServiceId,
    hasSensitiveContent,
    sensitiveContentTypeIds,
  } = req.body;

  // Validate userId
  if (!userId) {
    throw new AppError(401, 'User ID is required');
  }

  // Validate required fields
  if (!title || title.trim().length === 0) {
    throw new AppError(400, 'Title is required');
  }

  // Create portfolio
  const [portfolio] = await db
    .insert(portfolios)
    .values({
      userId,
      title: title.trim(),
      description: description?.trim() || null,
      tags: tags || [],
      status: status || 'draft',
      linkedToCommission: linkedToCommission || false,
      commissionServiceId: commissionServiceId || null,
      hasSensitiveContent: hasSensitiveContent || false,
      publishedAt: status === 'published' ? new Date() : null,
    })
    .returning();

  // Add sensitive content types if provided
  if (hasSensitiveContent && sensitiveContentTypeIds && sensitiveContentTypeIds.length > 0) {
    const sensitiveContentValues = sensitiveContentTypeIds.map((typeId: number) => ({
      portfolioId: portfolio.id,
      contentTypeId: typeId,
    }));

    await db.insert(portfolioSensitiveContent).values(sensitiveContentValues);
  }

  res.status(201).json({
    success: true,
    portfolio,
  });
});

// Get portfolio by ID
export const getPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const portfolioId = parseInt(id);

  // Get portfolio
  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId));

  if (!portfolio) {
    throw new AppError(404, 'Portfolio not found');
  }

  // Get media
  const media = await db
    .select()
    .from(portfolioMedia)
    .where(eq(portfolioMedia.portfolioId, portfolioId))
    .orderBy(portfolioMedia.sortOrder);

  // Get sensitive content types
  const sensitiveContent = await db
    .select({
      type: sensitiveContentTypes.type,
      displayName: sensitiveContentTypes.displayName,
    })
    .from(portfolioSensitiveContent)
    .innerJoin(
      sensitiveContentTypes,
      eq(portfolioSensitiveContent.contentTypeId, sensitiveContentTypes.id)
    )
    .where(eq(portfolioSensitiveContent.portfolioId, portfolioId));

  res.json({
    success: true,
    portfolio: {
      ...portfolio,
      media,
      sensitiveContentTypes: sensitiveContent.map((sc) => sc.type),
    },
  });
});

// Get user's portfolios
export const getUserPortfolios = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status, limit = 20, offset = 0 } = req.query;

  // Build the where conditions
  const whereConditions = [eq(portfolios.userId, userId)];
  
  // Add status filter if provided
  if (status && (status === 'draft' || status === 'published')) {
    whereConditions.push(eq(portfolios.status, status as string));
  }

  const userPortfolios = await db
    .select()
    .from(portfolios)
    .where(and(...whereConditions))
    .orderBy(desc(portfolios.createdAt))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  // Get media for each portfolio
  const portfoliosWithMedia = await Promise.all(
    userPortfolios.map(async (portfolio) => {
      const media = await db
        .select()
        .from(portfolioMedia)
        .where(eq(portfolioMedia.portfolioId, portfolio.id))
        .orderBy(portfolioMedia.sortOrder);

      return {
        ...portfolio,
        media,
      };
    })
  );

  res.json({
    success: true,
    portfolios: portfoliosWithMedia,
    total: portfoliosWithMedia.length,
  });
});


// Update portfolio
export const updatePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const portfolioId = parseInt(id);

  const {
    userId, // Frontend should send this for ownership verification
    title,
    description,
    tags,
    status,
    linkedToCommission,
    commissionServiceId,
    hasSensitiveContent,
    sensitiveContentTypeIds,
  } = req.body;

  if (!userId) {
    throw new AppError(401, 'User ID is required');
  }

  // Check if portfolio exists and belongs to user
  const [existingPortfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId));

  if (!existingPortfolio) {
    throw new AppError(404, 'Portfolio not found');
  }

  if (existingPortfolio.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  // Update portfolio
  const [updatedPortfolio] = await db
    .update(portfolios)
    .set({
      title: title?.trim() || existingPortfolio.title,
      description: description?.trim() || existingPortfolio.description,
      tags: tags !== undefined ? tags : existingPortfolio.tags,
      status: status || existingPortfolio.status,
      linkedToCommission: linkedToCommission ?? existingPortfolio.linkedToCommission,
      commissionServiceId: commissionServiceId ?? existingPortfolio.commissionServiceId,
      hasSensitiveContent: hasSensitiveContent ?? existingPortfolio.hasSensitiveContent,
      publishedAt: 
        status === 'published' && !existingPortfolio.publishedAt 
          ? new Date() 
          : existingPortfolio.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(portfolios.id, portfolioId))
    .returning();

  // Update sensitive content types if provided
  if (hasSensitiveContent !== undefined) {
    // Delete existing sensitive content associations
    await db
      .delete(portfolioSensitiveContent)
      .where(eq(portfolioSensitiveContent.portfolioId, portfolioId));

    // Add new associations
    if (hasSensitiveContent && sensitiveContentTypeIds && sensitiveContentTypeIds.length > 0) {
      const sensitiveContentValues = sensitiveContentTypeIds.map((typeId: number) => ({
        portfolioId,
        contentTypeId: typeId,
      }));

      await db.insert(portfolioSensitiveContent).values(sensitiveContentValues);
    }
  }

  res.json({
    success: true,
    portfolio: updatedPortfolio,
  });
});

// Delete portfolio
export const deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body; // Frontend should send this
  const portfolioId = parseInt(id);

  if (!userId) {
    throw new AppError(401, 'User ID is required');
  }

  // Check if portfolio exists and belongs to user
  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId));

  if (!portfolio) {
    throw new AppError(404, 'Portfolio not found');
  }

  if (portfolio.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  // Get all media to delete from R2
  const media = await db
    .select()
    .from(portfolioMedia)
    .where(eq(portfolioMedia.portfolioId, portfolioId));

  // Delete media files from R2
  for (const item of media) {
    if (item.fileUrl) {
      try {
        // Extract key from URL
        const key = item.fileUrl.split('/').slice(3).join('/');
        await deleteFromR2(key);
      } catch (error) {
        console.error('Error deleting file from R2:', error);
      }
    }
  }

  // Delete portfolio (cascade will delete media and sensitive content associations)
  await db.delete(portfolios).where(eq(portfolios.id, portfolioId));

  res.json({
    success: true,
    message: 'Portfolio deleted successfully',
  });
});

// Upload media to portfolio
export const uploadPortfolioMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const portfolioId = parseInt(id);
  const { userId, youtubeUrl, sortOrder } = req.body;

  if (!userId) {
    throw new AppError(401, 'User ID is required');
  }

  // Check if portfolio exists and belongs to user
  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId));

  if (!portfolio) {
    throw new AppError(404, 'Portfolio not found');
  }

  if (portfolio.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  // Handle YouTube URL
  if (youtubeUrl) {
    const validation = validateYouTubeUrl(youtubeUrl);
    if (!validation.valid) {
      throw new AppError(400, validation.error || 'Invalid YouTube URL');
    }

    const [media] = await db
      .insert(portfolioMedia)
      .values({
        portfolioId,
        mediaType: 'youtube',
        youtubeUrl,
        youtubeVideoId: validation.videoId,
        sortOrder: sortOrder || 0,
      })
      .returning();

    res.json({
      success: true,
      media,
    });
    return;
  }

  // Handle image upload
  const file = req.file;
  if (!file) {
    throw new AppError(400, 'No file or YouTube URL provided');
  }

  // Upload to R2
  const { url, key } = await uploadToR2(file, `portfolio/${userId}/${portfolioId}`);

  const [media] = await db
    .insert(portfolioMedia)
    .values({
      portfolioId,
      mediaType: 'image',
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.mimetype,
      sortOrder: sortOrder || 0,
    })
    .returning();

  res.json({
    success: true,
    media,
  });
});

// Delete media from portfolio
export const deletePortfolioMedia = asyncHandler(async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const { userId } = req.body;
  const mediaIdInt = parseInt(mediaId);

  if (!userId) {
    throw new AppError(401, 'User ID is required');
  }

  // Get media with portfolio info
  const [mediaItem] = await db
    .select({
      media: portfolioMedia,
      portfolio: portfolios,
    })
    .from(portfolioMedia)
    .innerJoin(portfolios, eq(portfolioMedia.portfolioId, portfolios.id))
    .where(eq(portfolioMedia.id, mediaIdInt));

  if (!mediaItem) {
    throw new AppError(404, 'Media not found');
  }

  if (mediaItem.portfolio.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  // Delete from R2 if it's an image
  if (mediaItem.media.fileUrl) {
    try {
      const key = mediaItem.media.fileUrl.split('/').slice(3).join('/');
      await deleteFromR2(key);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
    }
  }

  // Delete from database
  await db.delete(portfolioMedia).where(eq(portfolioMedia.id, mediaIdInt));

  res.json({
    success: true,
    message: 'Media deleted successfully',
  });
});

// Get all sensitive content types (for UI dropdown)
export const getSensitiveContentTypes = asyncHandler(async (req: Request, res: Response) => {
  const types = await db.select().from(sensitiveContentTypes);

  res.json({
    success: true,
    types,
  });
});