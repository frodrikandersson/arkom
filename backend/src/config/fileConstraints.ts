// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  // Chat/messaging attachments
  MESSAGE_ATTACHMENT: 10 * 1024 * 1024,        // 10MB
  
  // Profile/account images
  PROFILE_IMAGE: 5 * 1024 * 1024,              // 5MB
  BANNER_IMAGE: 10 * 1024 * 1024,              // 10MB
  
  // Portfolio/artwork (for display, not commerce)
  ARTWORK_PORTFOLIO: 50 * 1024 * 1024,         // 50MB
  
  // Commerce/shop products (high quality needed for sales)
  PRODUCT_IMAGE: 100 * 1024 * 1024,            // 100MB (master files)
  PRODUCT_PREVIEW: 20 * 1024 * 1024,           // 20MB (preview/thumbnail)
  DIGITAL_PRODUCT: 500 * 1024 * 1024,          // 500MB (downloadable files for buyers)
  
  // Special file types
  AUDIO_FILE: 50 * 1024 * 1024,                // 50MB
  VIDEO_FILE: 200 * 1024 * 1024,               // 200MB
  DOCUMENT: 25 * 1024 * 1024,                  // 25MB
  ARCHIVE: 100 * 1024 * 1024,                  // 100MB (zip/rar)
  MODEL_3D: 100 * 1024 * 1024,                 // 100MB
} as const;

// File type definitions
export const FILE_TYPES = {
  // Images
  IMAGE: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif'],
    accept: 'image/*',
  },
  
  // Professional image formats (for artists)
  IMAGE_PROFESSIONAL: {
    mimeTypes: [
      'image/vnd.adobe.photoshop',     // .psd
      'application/postscript',        // .ai
      'image/x-xcf',                   // .xcf (GIMP)
    ],
    extensions: ['.psd', '.ai', '.xcf'],
    accept: '.psd,.ai,.xcf',
  },
  
  // Video
  VIDEO: {
    mimeTypes: [
      'video/mp4',
      'video/quicktime',      // .mov
      'video/x-msvideo',      // .avi
      'video/webm',
      'video/x-matroska',     // .mkv
    ],
    extensions: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    accept: 'video/*',
  },
  
  // Audio
  AUDIO: {
    mimeTypes: [
      'audio/mpeg',           // .mp3
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/mp4',            // .m4a
      'audio/aac',
    ],
    extensions: ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'],
    accept: 'audio/*',
  },
  
  // 3D Models
  MODEL_3D: {
    mimeTypes: [
      'model/gltf-binary',           // .glb
      'model/gltf+json',            // .gltf
      'model/obj',                  // .obj
      'application/octet-stream',   // .fbx, .blend, .stl
    ],
    extensions: ['.obj', '.fbx', '.gltf', '.glb', '.stl', '.blend', '.max', '.ma', '.mb'],
    accept: '.obj,.fbx,.gltf,.glb,.stl,.blend,.max,.ma,.mb',
  },
  
  // Documents
  DOCUMENT: {
    mimeTypes: [
      'application/pdf',
      'application/msword',                                                         // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
      'text/plain',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    accept: '.pdf,.doc,.docx,.txt',
  },
  
  // Archives
  ARCHIVE: {
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
    extensions: ['.zip', '.rar', '.7z'],
    accept: '.zip,.rar,.7z',
  },
} as const;

// Context-specific file rules
export const FILE_RULES = {
  MESSAGE_ATTACHMENT: {
    allowedTypes: [
      ...FILE_TYPES.IMAGE.mimeTypes,
      ...FILE_TYPES.VIDEO.mimeTypes,
      ...FILE_TYPES.AUDIO.mimeTypes,
      ...FILE_TYPES.DOCUMENT.mimeTypes,
    ],
    maxSize: FILE_SIZE_LIMITS.MESSAGE_ATTACHMENT,
    accept: `${FILE_TYPES.IMAGE.accept},${FILE_TYPES.VIDEO.accept},${FILE_TYPES.AUDIO.accept},${FILE_TYPES.DOCUMENT.accept}`,
  },
  
  PROFILE_IMAGE: {
    allowedTypes: FILE_TYPES.IMAGE.mimeTypes,
    maxSize: FILE_SIZE_LIMITS.PROFILE_IMAGE,
    accept: FILE_TYPES.IMAGE.accept,
  },
  
  BANNER_IMAGE: {
    allowedTypes: FILE_TYPES.IMAGE.mimeTypes,
    maxSize: FILE_SIZE_LIMITS.BANNER_IMAGE,
    accept: FILE_TYPES.IMAGE.accept,
  },
  
  ARTWORK_PORTFOLIO: {
    allowedTypes: [
      ...FILE_TYPES.IMAGE.mimeTypes,
      ...FILE_TYPES.IMAGE_PROFESSIONAL.mimeTypes,
      ...FILE_TYPES.VIDEO.mimeTypes,
      ...FILE_TYPES.AUDIO.mimeTypes,
      ...FILE_TYPES.MODEL_3D.mimeTypes,
    ],
    maxSize: FILE_SIZE_LIMITS.ARTWORK_PORTFOLIO,
    accept: `${FILE_TYPES.IMAGE.accept},${FILE_TYPES.IMAGE_PROFESSIONAL.accept},${FILE_TYPES.VIDEO.accept},${FILE_TYPES.AUDIO.accept},${FILE_TYPES.MODEL_3D.accept}`,
  },
  
  // For Stripe Connect shop products
  PRODUCT_IMAGE: {
    allowedTypes: [
      ...FILE_TYPES.IMAGE.mimeTypes,
      ...FILE_TYPES.IMAGE_PROFESSIONAL.mimeTypes,
    ],
    maxSize: FILE_SIZE_LIMITS.PRODUCT_IMAGE,
    accept: `${FILE_TYPES.IMAGE.accept},${FILE_TYPES.IMAGE_PROFESSIONAL.accept}`,
  },
  
  // Files that buyers will download after purchase
  DIGITAL_PRODUCT: {
    allowedTypes: [
      ...FILE_TYPES.IMAGE.mimeTypes,
      ...FILE_TYPES.IMAGE_PROFESSIONAL.mimeTypes,
      ...FILE_TYPES.VIDEO.mimeTypes,
      ...FILE_TYPES.AUDIO.mimeTypes,
      ...FILE_TYPES.MODEL_3D.mimeTypes,
      ...FILE_TYPES.ARCHIVE.mimeTypes,
    ],
    maxSize: FILE_SIZE_LIMITS.DIGITAL_PRODUCT,
    accept: `${FILE_TYPES.IMAGE.accept},${FILE_TYPES.IMAGE_PROFESSIONAL.accept},${FILE_TYPES.VIDEO.accept},${FILE_TYPES.AUDIO.accept},${FILE_TYPES.MODEL_3D.accept},${FILE_TYPES.ARCHIVE.accept}`,
  },
} as const;

// Helper to format bytes for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Helper to validate file
export const validateFile = (file: File, context: keyof typeof FILE_RULES): { valid: boolean; error?: string } => {
  const rules = FILE_RULES[context];
  
  // Check size
  if (file.size > rules.maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(rules.maxSize)}`,
    };
  }
  
  // Check type - cast to readonly string array for comparison
  const allowedTypes = rules.allowedTypes as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${rules.accept}`,
    };
  }
  
  return { valid: true };
};

