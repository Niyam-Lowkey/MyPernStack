"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUpload = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (hasCloudinary) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const processUpload = async (filePath, fileName, reqHost) => {
    if (hasCloudinary) {
        try {
            const result = await cloudinary_1.v2.uploader.upload(filePath, {
                folder: 'vape_catalog',
                resource_type: 'image',
            });
            // Clean up the local file after uploading to Cloudinary
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            // Generate optimized thumbnail URL using Cloudinary transformations
            const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/c_fill,h_200,w_200,q_auto,f_auto/');
            return {
                url: result.secure_url,
                thumbnailUrl: thumbnailUrl || result.secure_url,
            };
        }
        catch (error) {
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
exports.processUpload = processUpload;
