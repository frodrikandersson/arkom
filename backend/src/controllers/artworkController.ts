import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { artworks } from '../config/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { uploadToR2 } from '../config/r2.js';

export const uploadArtwork = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, description, fileType, tags, isPublic } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!title || !fileType) {
      res.status(400).json({ error: 'Title and file type are required' });
      return;
    }

    const validFileTypes = ['2d', '3d', 'image'];
    if (!validFileTypes.includes(fileType)) {
      res.status(400).json({ error: 'Invalid file type. Must be 2d, 3d, or image' });
      return;
    }

    // Validate file type (images only for now)
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'Only image files are allowed' });
      return;
    }

    // Upload to R2
    const { url } = await uploadToR2(file, 'artworks');

    // Parse tags if provided as string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map((t: string) => t.trim());
      }
    }

    // Create artwork record
    const [artwork] = await db.insert(artworks).values({
      userId,
      title,
      description: description || null,
      fileUrl: url,
      thumbnailUrl: url, // For now, use same URL. Later can add thumbnail generation
      fileType,
      tags: parsedTags || null,
      isPublic: isPublic === 'true' || isPublic === true,
    }).returning();

    res.json({ artwork });
  } catch (error) {
    console.error('Upload artwork error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserArtworks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { includePrivate } = req.query;
    const requesterId = req.query.requesterId as string;

    // If requester is viewing their own profile, show private artworks
    const showPrivate = includePrivate === 'true' && requesterId === userId;

    let artworkList;
    if (showPrivate) {
      artworkList = await db
        .select()
        .from(artworks)
        .where(eq(artworks.userId, userId))
        .orderBy(desc(artworks.createdAt));
    } else {
      artworkList = await db
        .select()
        .from(artworks)
        .where(
          and(
            eq(artworks.userId, userId),
            eq(artworks.isPublic, true)
          )
        )
        .orderBy(desc(artworks.createdAt));
    }

    res.json({ artworks: artworkList });
  } catch (error) {
    console.error('Get user artworks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArtwork = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;

    const [artwork] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, parseInt(artworkId)));

    if (!artwork) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }

    // Increment view count
    const currentViewCount = artwork.viewCount ?? 0;
    await db
      .update(artworks)
      .set({ viewCount: currentViewCount + 1 })
      .where(eq(artworks.id, parseInt(artworkId)));

    res.json({ artwork: { ...artwork, viewCount: currentViewCount + 1 } });
  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateArtwork = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;
    const { userId, title, description, tags, isPublic } = req.body;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, parseInt(artworkId)));

    if (!existing) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to update this artwork' });
      return;
    }

    // Update artwork
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const [updated] = await db
      .update(artworks)
      .set(updateData)
      .where(eq(artworks.id, parseInt(artworkId)))
      .returning();

    res.json({ artwork: updated });
  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteArtwork = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;
    const { userId } = req.body;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(artworks)
      .where(eq(artworks.id, parseInt(artworkId)));

    if (!existing) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this artwork' });
      return;
    }

    // Delete artwork
    await db.delete(artworks).where(eq(artworks.id, parseInt(artworkId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
