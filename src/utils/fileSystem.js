const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function ensureUploadDirectory(uploadDir) {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(chalk.green(`✅ Created upload directory: ${uploadDir}`));
    }
}

function getFilesList(uploadDir) {
    return fs.readdirSync(uploadDir)
        .filter(filename => {
            return !filename.startsWith('.') && fs.statSync(path.join(uploadDir, filename)).isFile();
        })
        .map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            return {
                name: filename,
                size: stats.size,
                modified: stats.mtime,
                sizeFormatted: formatFileSize(stats.size)
            };
        })
        .sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

module.exports = {
    formatFileSize,
    ensureUploadDirectory,
    getFilesList
};