const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { formatFileSize } = require('../utils/fileSystem');

function configureUpload(uploadDir) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const originalName = file.originalname;
            const filePath = path.join(uploadDir, originalName);

            if (fs.existsSync(filePath)) {
                const timestamp = Date.now();
                const ext = path.extname(originalName);
                const name = path.basename(originalName, ext);
                cb(null, `${name}_${timestamp}${ext}`);
            } else {
                cb(null, originalName);
            }
        }
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 1024 // 1GB limit
        },
        fileFilter: (req, file, cb) => {
            console.log(chalk.blue(`📤 Uploading: ${file.originalname} (${formatFileSize(file.size || 0)})`));
            cb(null, true);
        }
    });
}

module.exports = { configureUpload };