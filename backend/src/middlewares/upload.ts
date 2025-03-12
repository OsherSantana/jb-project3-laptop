import { NextFunction, Request, Response } from "express";
// npm install multer
// npm install @types/multer --save-dev
import multer from "multer";
import fs from "fs";
import AppError from "../errors/app-error";
import { StatusCodes } from "http-status-codes";

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

// File filter to accept only images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Create multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware for handling vacation image uploads
export function uploadVacationImage(req: Request, res: Response, next: NextFunction) {
    const uploadSingle = upload.single('image');

    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError(StatusCodes.BAD_REQUEST, 'File too large. Maximum size is 5MB'));
            }
            return next(new AppError(StatusCodes.BAD_REQUEST, err.message));
        } else if (err) {
            return next(new AppError(StatusCodes.BAD_REQUEST, err.message));
        }

        // If no file was uploaded
        if (!req.file) {
            return next(new AppError(StatusCodes.BAD_REQUEST, 'Please upload an image file'));
        }

        // Add the filename to the request body
        req.body.imageFileName = req.file.filename;
        next();
    });
}