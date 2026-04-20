const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─────────────────────────────────────────────────────
//  CLOUDINARY CONFIG
//  Set these 3 env vars in Railway / .env file:
//    CLOUDINARY_CLOUD_NAME=xxxx
//    CLOUDINARY_API_KEY=xxxx
//    CLOUDINARY_API_SECRET=xxxx
// ─────────────────────────────────────────────────────
const useCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('☁️  Cloudinary storage: ENABLED');
} else {
    console.log('💾  Local disk storage: ENABLED (set CLOUDINARY_* env vars to switch)');
}

// ─────────────────────────────────────────────────────
//  CLOUDINARY STORAGE — for preview images only
// ─────────────────────────────────────────────────────
const cloudinaryImageStorage = useCloudinary
    ? new CloudinaryStorage({
        cloudinary,
        params: (req, file) => ({
            folder: 'templatehub/previews',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
            public_id: `preview_${Date.now()}`,
        }),
    })
    : null;

// ─────────────────────────────────────────────────────
//  LOCAL DISK STORAGE — for template files + fallback images
// ─────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// ─────────────────────────────────────────────────────
//  FILE FILTER — block dangerous executables
// ─────────────────────────────────────────────────────
const fileFilter = function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.exe', '.sh', '.bat', '.cmd', '.msi', '.src'].includes(ext)) {
        return cb(new Error('Executable files are not allowed for security reasons.'));
    }
    cb(null, true);
};

// ─────────────────────────────────────────────────────
//  SMART STORAGE — picks Cloudinary for images, disk for files
// ─────────────────────────────────────────────────────
const smartStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Combined uploader: image field uses Cloudinary (if available), file field uses disk
const upload = useCloudinary
    ? {
        fields: (fields) => {
            // For requests with both file + image fields
            const imageField = fields.find(f => f.name === 'image');
            const fileField  = fields.find(f => f.name === 'file');

            const cloudUpload = multer({
                storage: cloudinaryImageStorage,
                limits: { fileSize: 10 * 1024 * 1024 },
            });

            const diskUpload = multer({
                storage: diskStorage,
                limits: { fileSize: 50 * 1024 * 1024 },
                fileFilter,
            });

            return (req, res, next) => {
                // Upload image to Cloudinary first
                cloudUpload.single('image')(req, res, (err) => {
                    if (err) {
                        // Non-fatal: fall through
                    }
                    const cloudFile = req.file;

                    // Upload template file to disk
                    diskUpload.fields([{ name: 'file', maxCount: 1 }])(req, res, (err2) => {
                        if (err2) return next(err2);
                        // Re-attach cloudinary image under req.files.image
                        if (cloudFile) {
                            if (!req.files) req.files = {};
                            req.files['image'] = [cloudFile];
                        }
                        next();
                    });
                });
            };
        },
        // Convenience: single file upload (disk)
        single: (fieldName) => multer({ storage: diskStorage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter }).single(fieldName),
    }
    : multer({
        storage: diskStorage,
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter,
    });

// ─────────────────────────────────────────────────────
//  HELPER: Get public URL for an uploaded image
//  Works for both Cloudinary URLs and local /uploads/ paths
// ─────────────────────────────────────────────────────
const getImageUrl = (file) => {
    if (!file) return null;
    // Cloudinary files have .path or .secure_url
    if (file.path && file.path.startsWith('http')) return file.path;
    if (file.secure_url) return file.secure_url;
    // Local disk file
    return `/uploads/${file.filename}`;
};

module.exports = { upload, getImageUrl, useCloudinary };
