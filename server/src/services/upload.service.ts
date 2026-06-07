import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

interface UploadResponse {
  url: string;
  thumbnailUrl: string;
}

export const processUpload = async (
  filePath: string,
  fileName: string,
  reqHost: string
): Promise<UploadResponse> => {
  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'vape_catalog',
        resource_type: 'image',
      });
      
      // Clean up the local file after uploading to Cloudinary
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Generate optimized thumbnail URL using Cloudinary transformations
      const thumbnailUrl = result.secure_url.replace(
        '/upload/',
        '/upload/c_fill,h_200,w_200,q_auto,f_auto/'
      );

      return {
        url: result.secure_url,
        thumbnailUrl: thumbnailUrl || result.secure_url,
      };
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local storage:', error);
      // Fallback is handled below
    }
  }

  // Local Storage Fallback
  // Formulate the local URL relative to the host
  const protocol = reqHost.includes('localhost') ? 'http' : 'https';
  const url = `${protocol}://${reqHost}/uploads/${fileName}`;
  
  return {
    url,
    thumbnailUrl: url, // For local files, we just use the same image
  };
};
