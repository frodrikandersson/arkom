import { PortfolioMediaUpload } from "./Portfolio";

export interface CreateCategoryData {
  name: string;
  sortOrder: number;
}

export interface UpdateCategoryData {
  name: string;
}

export interface SortOrderUpdate {
  id: number;
  sortOrder: number;
}

export interface ServiceCategory {
  id: number | string;
  name: string;
  sortOrder: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceData {
  categoryId: string | number;
  status: string;
  notifyFollowers: boolean;
  slotsData: any;
  startDate: string;
  endDate: string;
  searchCategoryData: any;
  serviceType: string;
  communicationStyle: string;
  requestingProcess: string;
  serviceName: string;
  currency: string;
  basePrice: string;
  fixedPrice: string;
  proposalScope: string;
  estimatedStart: string;
  guaranteedDelivery: string;
  description: string;
  searchTags: string[];
  mediaItems: PortfolioMediaUpload[];
  workflowId: string;
  requestFormId: string;
  termsId: string;
}

export interface ServiceMedia {
  id: number;
  serviceId: number;
  mediaType: string;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
  sortOrder: number;
  hasSensitiveContent: boolean;
  fileSize: number | null;
  mimeType: string | null;
}

export interface ServiceSearchCategoryData {
  isDiscoverable: boolean;
  catalogueId: number;
  categoryId: number;
  subCategorySelections: number[];
}

export interface Service {
  id: number;
  userId: string;
  categoryId: number | null;
  title: string;
  description: string;
  serviceType: string;
  communicationStyle: string;
  requestingProcess: string;
  basePrice: number;
  fixedPrice: number;
  currency: string;
  proposalScope: string | null;
  estimatedStart: string;
  guaranteedDelivery: string;
  searchTags: string[];
  slotsData: any;
  workflowId: string | null;
  requestFormId: string | null;
  termsId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  isActive: boolean;
  notifyFollowers: boolean;
  orderCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  media?: ServiceMedia[];
  searchCategoryData?: ServiceSearchCategoryData | null;
}