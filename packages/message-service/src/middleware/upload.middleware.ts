import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Local Storage Engine (Fallback / Local Dev)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// 2. Cloudinary Storage Engine
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'chat_app_uploads',
    resource_type: 'auto', 
    public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
  }),
});

// Toggle storage based on environment or availability of API key
const useCloudinary = Boolean(process.env.CLOUDINARY_API_KEY);
const storageEngine = useCloudinary ? cloudinaryStorage : localStorage;

export const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'audio/mpeg',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});