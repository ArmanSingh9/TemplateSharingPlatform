const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        // Allow all file types as per user request to 'upload any type of file'
        // For production, you'd want to block executable files (.exe, .sh, .bat)
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.exe', '.sh', '.bat', '.cmd', '.src'].includes(ext)) {
            return cb(new Error('Executable files are not allowed for security reasons.'));
        }
        cb(null, true);
    }
});

module.exports = upload;
