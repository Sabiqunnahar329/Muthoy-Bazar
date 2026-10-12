import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const cloudinaryEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const hasCloudinaryConfig = cloudinaryEnv.every((key) => process.env[key]);
const hasPartialCloudinaryConfig = cloudinaryEnv.some((key) => process.env[key]) && !hasCloudinaryConfig;

if (hasPartialCloudinaryConfig) {
  throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET together.');
}

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('Cloudinary is not configured; product image uploads will be rejected in production.');
}

const dir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
fs.mkdirSync(dir, { recursive: true });

const cloudinaryStorage = {
  _handleFile(req, file, callback) {
    const stream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || 'muthoy-bazar/products', resource_type: 'image' },
      (error, result) => {
        if (error) return callback(error);
        callback(null, {
          filename: result.public_id,
          secureUrl: result.secure_url,
          size: result.bytes,
        });
      }
    );
    file.stream.pipe(stream);
  },
  _removeFile(req, file, callback) {
    if (!file.filename) return callback(null);
    cloudinary.uploader.destroy(file.filename, { resource_type: 'image' })
      .then(() => callback(null))
      .catch(callback);
  },
};

const productionStorage = {
  _handleFile(req, file, callback) {
    const error = new Error('Product image storage is not configured. Set the Cloudinary environment variables.');
    error.status = 503;
    callback(error);
  },
  _removeFile(req, file, callback) {
    callback(null);
  },
};

export default multer({
  storage: hasCloudinaryConfig
    ? cloudinaryStorage
    : process.env.NODE_ENV === 'production'
      ? productionStorage
      : multer.diskStorage({
      destination: dir,
      filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
    }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});
export const uploadDir = dir;
