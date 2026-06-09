"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const upload_service_1 = require("../services/upload.service");
const AppError_1 = __importDefault(require("../utils/AppError"));
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError_1.default('No image file provided', 400));
        }
        const host = req.get('host') || 'localhost:5000';
        const filePath = req.file.path;
        const fileName = req.file.filename;
        const result = await (0, upload_service_1.processUpload)(filePath, fileName, host);
        return res.status(200).json({
            status: 'success',
            data: result,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadImage = uploadImage;
