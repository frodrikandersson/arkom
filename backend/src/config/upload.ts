import multer from 'multer';
import { FILE_RULES } from './fileConstraints.js';

// Helper type to filter out non-file rules
type FileUploadContext = Exclude<keyof typeof FILE_RULES, 'PORTFOLIO_YOUTUBE'>;

// Factory function to create upload middleware for different contexts
export const createUploadMiddleware = (context: FileUploadContext) => {
  const rules = FILE_RULES[context];
  
  return multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // Now TypeScript knows rules has allowedTypes
      if ((rules.allowedTypes as readonly string[]).includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${rules.accept}`));
      }
    },
    limits: {
      fileSize: rules.maxSize,
    },
  });
};

// Pre-configured middleware for common use cases
export const messageUpload = createUploadMiddleware('MESSAGE_ATTACHMENT');
export const artworkUpload = createUploadMiddleware('ARTWORK_PORTFOLIO');
export const profileImageUpload = createUploadMiddleware('PROFILE_IMAGE');
export const bannerImageUpload = createUploadMiddleware('BANNER_IMAGE');

// Keep the old 'upload' export for backward compatibility with existing routes
export const upload = messageUpload;
