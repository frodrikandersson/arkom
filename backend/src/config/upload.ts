import multer from 'multer';
import { FILE_RULES } from './fileConstraints.js';

// Factory function to create upload middleware for different contexts
export const createUploadMiddleware = (context: keyof typeof FILE_RULES) => {
  const rules = FILE_RULES[context];
  
  return multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // Cast to string array for comparison
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
