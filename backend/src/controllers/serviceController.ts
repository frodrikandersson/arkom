import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { services, serviceMedia, serviceMediaSensitiveContent, serviceSearchCategories, serviceSubCategorySelections } from '../config/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToR2, deleteFromR2 } from '../config/r2.js';
import { validateYouTubeUrl } from '../config/fileConstraints.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Helper function to convert price from string to cents
const convertPriceToCents = (price: string): number => {
  return Math.round(parseFloat(price) * 100);
};

// Create a new service
export const createService = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    categoryId,
    status,
    notifyFollowers,
    slotsData,
    startDate,
    endDate,
    searchCategoryData,
    serviceType,
    communicationStyle,
    requestingProcess,
    serviceName,
    currency,
    basePrice,
    fixedPrice,
    proposalScope,
    estimatedStart,
    guaranteedDelivery,
    description,
    searchTags,
    workflowId,
    requestFormId,
    termsId,
  } = req.body;

  // Validate required fields
  if (!serviceName || !description) {
    res.status(400).json({
      success: false,
      message: 'Service name and description are required',
    });
    return;
  }

  // Convert prices to cents
  const basePriceCents = basePrice ? convertPriceToCents(basePrice) : 0;
  const fixedPriceCents = fixedPrice ? convertPriceToCents(fixedPrice) : 0;

  // Validate pricing based on requesting process
  if (requestingProcess === 'custom_proposal' && basePriceCents <= 0) {
    res.status(400).json({
      success: false,
      message: 'Base price must be greater than 0 for custom proposals',
    });
    return;
  }

  if (requestingProcess === 'instant_order' && fixedPriceCents <= 0) {
    res.status(400).json({
      success: false,
      message: 'Fixed price must be greater than 0 for instant orders',
    });
    return;
  }

  try {
    // Create the service
    const [service] = await db.insert(services).values({
      userId,
      categoryId: categoryId === 'other' ? null : parseInt(categoryId),
      title: serviceName,
      description,
      serviceType: serviceType || 'custom',
      communicationStyle: communicationStyle || 'open',
      requestingProcess: requestingProcess || 'custom_proposal',
      basePrice: basePriceCents,
      fixedPrice: fixedPriceCents,
      currency: currency || 'EUR',
      proposalScope,
      estimatedStart: estimatedStart || 'This month',
      guaranteedDelivery: guaranteedDelivery || '7 days',
      searchTags: searchTags || [],
      slotsData: slotsData || null,
      workflowId: workflowId || null,
      requestFormId: requestFormId || null,
      termsId: termsId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: status || 'DRAFT',
      notifyFollowers: notifyFollowers || false,
      isActive: true,
    }).returning();

    // Create search category if provided
    if (searchCategoryData) {
      const { catalogueId, categoryId: searchCatId, selectedFilters, subCategorySelections, isDiscoverable } = searchCategoryData;

      // Insert into service_search_categories
      const [searchCategory] = await db.insert(serviceSearchCategories).values({
        serviceId: service.id,
        catalogueId: parseInt(catalogueId),
        categoryId: parseInt(searchCatId),
        isDiscoverable: isDiscoverable ?? true,
      }).returning();

      // Insert selected filter options - support both formats:
      // 1. selectedFilters: { filterId: [optionId1, optionId2] } (legacy format)
      // 2. subCategorySelections: [optionId1, optionId2] (new flat array format)
      if (selectedFilters && Object.keys(selectedFilters).length > 0) {
        for (const [, optionIds] of Object.entries(selectedFilters)) {
          const optionIdArray = optionIds as number[];
          for (const optionId of optionIdArray) {
            await db.insert(serviceSubCategorySelections).values({
              serviceSearchCategoryId: searchCategory.id,
              filterOptionId: optionId,
            });
          }
        }
      } else if (subCategorySelections && subCategorySelections.length > 0) {
        // Handle flat array format from frontend
        for (const optionId of subCategorySelections) {
          await db.insert(serviceSubCategorySelections).values({
            serviceSearchCategoryId: searchCategory.id,
            filterOptionId: optionId,
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      service,
      message: 'Service created successfully',
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message,
    });
  }
});

// Upload service media (handles both images and YouTube URLs)
export const uploadServiceMedia = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const userId = req.user!.id;

  // Parse FormData values
  const youtubeUrl = req.body.youtubeUrl;
  const sortOrder = req.body.sortOrder ? parseInt(req.body.sortOrder) : 0;

  // Parse hasSensitiveContent (comes as string "true"/"false" from FormData)
  const hasSensitiveContent = req.body.hasSensitiveContent === 'true' || req.body.hasSensitiveContent === true;

  // Parse sensitiveContentTypeIds (comes as JSON string from FormData)
  let sensitiveContentTypeIds: number[] = [];
  if (req.body.sensitiveContentTypeIds) {
    try {
      sensitiveContentTypeIds = typeof req.body.sensitiveContentTypeIds === 'string'
        ? JSON.parse(req.body.sensitiveContentTypeIds)
        : req.body.sensitiveContentTypeIds;
    } catch (error) {
      console.error('Failed to parse sensitiveContentTypeIds:', error);
    }
  }

  // Check if service exists and belongs to user
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, parseInt(serviceId)));

  if (!service) {
    throw new AppError(404, 'Service not found');
  }

  if (service.userId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  // Handle YouTube URL
  if (youtubeUrl) {
    const validation = validateYouTubeUrl(youtubeUrl);
    if (!validation.valid) {
      throw new AppError(400, validation.error || 'Invalid YouTube URL');
    }

    // Generate YouTube thumbnail URL
    const thumbnailUrl = `https://img.youtube.com/vi/${validation.videoId}/hqdefault.jpg`;

    const [media] = await db
      .insert(serviceMedia)
      .values({
        serviceId: parseInt(serviceId),
        mediaType: 'youtube',
        youtubeUrl,
        youtubeVideoId: validation.videoId,
        thumbnailUrl,
        sortOrder,
        hasSensitiveContent,
      })
      .returning();

    // Add sensitive content types if provided
    if (hasSensitiveContent && sensitiveContentTypeIds && sensitiveContentTypeIds.length > 0) {
      const sensitiveContentValues = sensitiveContentTypeIds.map((typeId: number) => ({
        mediaId: media.id,
        contentTypeId: typeId,
      }));

      await db.insert(serviceMediaSensitiveContent).values(sensitiveContentValues);
    }

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
  const { url } = await uploadToR2(file, `services/${userId}/${serviceId}`);

  const [media] = await db
    .insert(serviceMedia)
    .values({
      serviceId: parseInt(serviceId),
      mediaType: 'image',
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.mimetype,
      sortOrder,
      hasSensitiveContent,
    })
    .returning();

  // Add sensitive content types if provided
  if (hasSensitiveContent && sensitiveContentTypeIds && sensitiveContentTypeIds.length > 0) {
    const sensitiveContentValues = sensitiveContentTypeIds.map((typeId: number) => ({
      mediaId: media.id,
      contentTypeId: typeId,
    }));

    await db.insert(serviceMediaSensitiveContent).values(sensitiveContentValues);
  }

  res.json({
    success: true,
    media,
  });
});

// Get all services for a user
export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const userServices = await db
      .select()
      .from(services)
      .where(eq(services.userId, userId))
      .orderBy(desc(services.createdAt));

    // Fetch media and search category data for each service
    const servicesWithData = await Promise.all(
      userServices.map(async (service) => {
        const media = await db
          .select()
          .from(serviceMedia)
          .where(eq(serviceMedia.serviceId, service.id))
          .orderBy(serviceMedia.sortOrder);

        // Get search category data
        const [searchCategoryRow] = await db
          .select()
          .from(serviceSearchCategories)
          .where(eq(serviceSearchCategories.serviceId, service.id));

        let searchCategoryData = null;
        if (searchCategoryRow) {
          const selections = await db
            .select()
            .from(serviceSubCategorySelections)
            .where(eq(serviceSubCategorySelections.serviceSearchCategoryId, searchCategoryRow.id));

          searchCategoryData = {
            isDiscoverable: searchCategoryRow.isDiscoverable,
            catalogueId: searchCategoryRow.catalogueId,
            categoryId: searchCategoryRow.categoryId,
            subCategorySelections: selections.map(s => s.filterOptionId),
          };
        }

        return {
          ...service,
          media,
          searchCategoryData,
        };
      })
    );

    res.json({
      success: true,
      services: servicesWithData,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
});

// Get services by requesting process type (public endpoint for browse pages)
export const getServicesByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params; // 'custom_proposal' or 'instant_order'

  if (!['custom_proposal', 'instant_order'].includes(type)) {
    res.status(400).json({
      success: false,
      message: 'Invalid service type. Must be custom_proposal or instant_order',
    });
    return;
  }

  try {
    // Import userSettings for joining
    const { userSettings } = await import('../config/schema.js');

    // Fetch all OPEN and active services of the specified type
    const allServices = await db
      .select({
        service: services,
        user: {
          userId: userSettings.userId,
          displayName: userSettings.displayName,
          username: userSettings.username,
          profileImageUrl: userSettings.profileImageUrl,
        },
      })
      .from(services)
      .leftJoin(userSettings, eq(services.userId, userSettings.userId))
      .where(
        and(
          eq(services.requestingProcess, type),
          eq(services.status, 'OPEN'),
          eq(services.isActive, true)
        )
      )
      .orderBy(desc(services.createdAt));

    // Fetch media and search category data for each service
    const servicesWithData = await Promise.all(
      allServices.map(async (item) => {
        const media = await db
          .select()
          .from(serviceMedia)
          .where(eq(serviceMedia.serviceId, item.service.id))
          .orderBy(serviceMedia.sortOrder);

        // Get search category data
        const [searchCategoryRow] = await db
          .select()
          .from(serviceSearchCategories)
          .where(eq(serviceSearchCategories.serviceId, item.service.id));

        let searchCategoryData = null;
        if (searchCategoryRow) {
          const selections = await db
            .select()
            .from(serviceSubCategorySelections)
            .where(eq(serviceSubCategorySelections.serviceSearchCategoryId, searchCategoryRow.id));

          searchCategoryData = {
            isDiscoverable: searchCategoryRow.isDiscoverable,
            catalogueId: searchCategoryRow.catalogueId,
            categoryId: searchCategoryRow.categoryId,
            subCategorySelections: selections.map(s => s.filterOptionId),
          };
        }

        return {
          ...item.service,
          media,
          searchCategoryData,
          shopOwner: {
            id: item.user?.userId || item.service.userId,
            displayName: item.user?.displayName || 'Unknown',
            username: item.user?.username || item.service.userId.slice(0, 8),
            profileImageUrl: item.user?.profileImageUrl || null,
          },
        };
      })
    );

    res.json({
      success: true,
      services: servicesWithData,
    });
  } catch (error: any) {
    console.error('Error fetching services by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
});

// Get services for a specific user (public endpoint)
export const getServicesByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const userServices = await db
      .select()
      .from(services)
      .where(eq(services.userId, userId))
      .orderBy(desc(services.createdAt));

    // Fetch media for each service
    const servicesWithMedia = await Promise.all(
      userServices.map(async (service) => {
        const media = await db
          .select()
          .from(serviceMedia)
          .where(eq(serviceMedia.serviceId, service.id))
          .orderBy(serviceMedia.sortOrder);

        return {
          ...service,
          media,
        };
      })
    );

    res.json({
      success: true,
      services: servicesWithMedia,
    });
  } catch (error: any) {
    console.error('Error fetching services for user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
});

// Get service by ID (includes search category data)
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;

  try {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(serviceId)));

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    // Get service media
    const media = await db
      .select()
      .from(serviceMedia)
      .where(eq(serviceMedia.serviceId, service.id))
      .orderBy(serviceMedia.sortOrder);

    // Get search category data
    const [searchCategoryRow] = await db
      .select()
      .from(serviceSearchCategories)
      .where(eq(serviceSearchCategories.serviceId, service.id));

    let searchCategoryData = null;
    if (searchCategoryRow) {
      // Get the selected filter options
      const selections = await db
        .select()
        .from(serviceSubCategorySelections)
        .where(eq(serviceSubCategorySelections.serviceSearchCategoryId, searchCategoryRow.id));

      searchCategoryData = {
        isDiscoverable: searchCategoryRow.isDiscoverable,
        catalogueId: searchCategoryRow.catalogueId,
        categoryId: searchCategoryRow.categoryId,
        subCategorySelections: selections.map(s => s.filterOptionId),
      };
    }

    res.json({
      success: true,
      service: {
        ...service,
        media,
        searchCategoryData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message,
    });
  }
});

// Update service
export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const userId = req.user!.id;
  const {
    categoryId,
    status,
    notifyFollowers,
    slotsData,
    startDate,
    endDate,
    searchCategoryData,
    serviceType,
    communicationStyle,
    requestingProcess,
    serviceName,
    currency,
    basePrice,
    fixedPrice,
    proposalScope,
    estimatedStart,
    guaranteedDelivery,
    description,
    searchTags,
    workflowId,
    requestFormId,
    termsId,
  } = req.body;

  // Verify ownership
  const [service] = await db
    .select()
    .from(services)
    .where(and(
      eq(services.id, parseInt(serviceId)),
      eq(services.userId, userId)
    ));

  if (!service) {
    throw new AppError(404, 'Service not found or unauthorized');
  }

  // Convert prices to cents if provided
  const basePriceCents = basePrice ? Math.round(parseFloat(basePrice) * 100) : undefined;
  const fixedPriceCents = fixedPrice ? Math.round(parseFloat(fixedPrice) * 100) : undefined;

  // Update service
  const [updatedService] = await db
    .update(services)
    .set({
      categoryId: categoryId !== undefined ? (categoryId === 'other' ? null : parseInt(categoryId)) : service.categoryId,
      status: status ?? service.status,
      notifyFollowers: notifyFollowers ?? service.notifyFollowers,
      slotsData: slotsData !== undefined ? slotsData : service.slotsData,
      startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : service.startDate,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : service.endDate,
      serviceType: serviceType ?? service.serviceType,
      communicationStyle: communicationStyle ?? service.communicationStyle,
      requestingProcess: requestingProcess ?? service.requestingProcess,
      title: serviceName ?? service.title,
      currency: currency ?? service.currency,
      basePrice: basePriceCents ?? service.basePrice,
      fixedPrice: fixedPriceCents ?? service.fixedPrice,
      proposalScope: proposalScope !== undefined ? proposalScope : service.proposalScope,
      estimatedStart: estimatedStart ?? service.estimatedStart,
      guaranteedDelivery: guaranteedDelivery ?? service.guaranteedDelivery,
      description: description ?? service.description,
      searchTags: searchTags !== undefined ? searchTags : service.searchTags,
      workflowId: workflowId !== undefined ? (workflowId || null) : service.workflowId,
      requestFormId: requestFormId !== undefined ? (requestFormId || null) : service.requestFormId,
      termsId: termsId !== undefined ? (termsId || null) : service.termsId,
      updatedAt: new Date(),
    })
    .where(eq(services.id, parseInt(serviceId)))
    .returning();

  // Update search category if provided
  if (searchCategoryData) {
    const { catalogueId: scCatalogueId, categoryId: scCategoryId, selectedFilters, subCategorySelections, isDiscoverable } = searchCategoryData;

    // Delete existing search category data
    const existingSearchCat = await db
      .select()
      .from(serviceSearchCategories)
      .where(eq(serviceSearchCategories.serviceId, parseInt(serviceId)));

    if (existingSearchCat.length > 0) {
      // Delete sub-category selections first
      await db.delete(serviceSubCategorySelections)
        .where(eq(serviceSubCategorySelections.serviceSearchCategoryId, existingSearchCat[0].id));
      // Delete search category
      await db.delete(serviceSearchCategories)
        .where(eq(serviceSearchCategories.serviceId, parseInt(serviceId)));
    }

    // Insert new search category
    const [newSearchCategory] = await db.insert(serviceSearchCategories).values({
      serviceId: parseInt(serviceId),
      catalogueId: parseInt(scCatalogueId),
      categoryId: parseInt(scCategoryId),
      isDiscoverable: isDiscoverable ?? true,
    }).returning();

    // Insert selected filter options - support both formats:
    // 1. selectedFilters: { filterId: [optionId1, optionId2] } (legacy format)
    // 2. subCategorySelections: [optionId1, optionId2] (new flat array format)
    if (selectedFilters && Object.keys(selectedFilters).length > 0) {
      for (const [, optionIds] of Object.entries(selectedFilters)) {
        const optionIdArray = optionIds as number[];
        for (const optionId of optionIdArray) {
          await db.insert(serviceSubCategorySelections).values({
            serviceSearchCategoryId: newSearchCategory.id,
            filterOptionId: optionId,
          });
        }
      }
    } else if (subCategorySelections && subCategorySelections.length > 0) {
      // Handle flat array format from frontend
      for (const optionId of subCategorySelections) {
        await db.insert(serviceSubCategorySelections).values({
          serviceSearchCategoryId: newSearchCategory.id,
          filterOptionId: optionId,
        });
      }
    }
  }

  res.json({
    success: true,
    service: updatedService,
  });
});

// Delete service
export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const userId = req.user!.id;

  try {
    // Verify ownership
    const [service] = await db
      .select()
      .from(services)
      .where(and(
        eq(services.id, parseInt(serviceId)),
        eq(services.userId, userId)
      ));

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found or unauthorized',
      });
      return;
    }

    // Delete service (cascade will handle media and other references)
    await db.delete(services).where(eq(services.id, parseInt(serviceId)));

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message,
    });
  }
});

// Delete service media
export const deleteServiceMedia = asyncHandler(async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const userId = req.user!.id;
  const mediaIdInt = parseInt(mediaId);

  // Get media with service info
  const [mediaItem] = await db
    .select({
      media: serviceMedia,
      service: services,
    })
    .from(serviceMedia)
    .innerJoin(services, eq(serviceMedia.serviceId, services.id))
    .where(eq(serviceMedia.id, mediaIdInt));

  if (!mediaItem) {
    throw new AppError(404, 'Media not found');
  }

  if (mediaItem.service.userId !== userId) {
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

  // Delete from database (cascade will handle sensitive content associations)
  await db.delete(serviceMedia).where(eq(serviceMedia.id, mediaIdInt));

  res.json({
    success: true,
    message: 'Media deleted successfully',
  });
});
