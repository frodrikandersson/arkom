// Sensitive Content Types
export type SensitiveContentType = 'gore' | 'sexual_nudity_18+' | 'other';

export interface SensitiveContentTypeData {
  id: number;
  type: SensitiveContentType;
  displayName: string;
  description?: string;
}

// Portfolio Status
export type PortfolioStatus = 'draft' | 'published';

// Media Types
export type MediaType = 'image' | 'youtube';

export interface PortfolioMedia {
  id: number;
  portfolioId: number;
  mediaType: MediaType;
  
  // Image fields
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number; // bytes
  mimeType?: string; // 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  
  // YouTube fields
  youtubeUrl?: string;
  youtubeVideoId?: string;
  
  // Sorting
  sortOrder: number;
  
  createdAt: string;
}

// Portfolio piece
export interface Portfolio {
  id: number;
  userId: string;
  
  // Status
  status: PortfolioStatus;
  
  // Commission link
  linkedToCommission: boolean;
  commissionServiceId?: number;
  
  // Sensitive content
  hasSensitiveContent: boolean;
  sensitiveContentTypes?: SensitiveContentType[]; // Array of selected types
  
  // Details
  title: string;
  description?: string;
  tags?: string[];
  
  // Media (populated from portfolio_media table)
  media?: PortfolioMedia[];
  
  // Stats
  viewCount: number;
  likeCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Form data for creating/editing portfolio
export interface PortfolioFormData {
  // Status
  status: PortfolioStatus;
  
  // Commission link
  linkedToCommission: boolean;
  commissionServiceId?: number;
  
  // Sensitive content
  hasSensitiveContent: boolean;
  sensitiveContentTypes: SensitiveContentType[];
  
  // Details
  title: string;
  description: string;
  tags: string; // Comma-separated string, converted to array before sending
  
  // Media (to be uploaded/added)
  media: PortfolioMediaUpload[];
}

// Media upload data
export interface PortfolioMediaUpload {
  id?: string; // Temporary ID for frontend (UUID or timestamp)
  mediaType: MediaType;
  
  // For image uploads
  file?: File;
  preview?: string; // Data URL for preview
  
  // For YouTube links
  youtubeUrl?: string;
  
  // Sorting
  sortOrder: number;
}

// Commission Service (minimal for dropdown)
export interface CommissionService {
  id: number;
  serviceName: string;
  description?: string;
}

// API Response types
export interface CreatePortfolioResponse {
  success: boolean;
  portfolio: Portfolio;
  message?: string;
}

export interface UpdatePortfolioResponse {
  success: boolean;
  portfolio: Portfolio;
  message?: string;
}

export interface GetPortfoliosResponse {
  success: boolean;
  portfolios: Portfolio[];
  total: number;
}
