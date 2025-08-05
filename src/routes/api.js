const express = require('express');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { getFilesList } = require('../utils/fileSystem');
const { getLocalIP } = require('../utils/network');

function setupRoutes(app, uploadDir, upload, port) {
    app.use((req, res, next) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        next();
    });

    app.get('/api/files', (req, res) => {
        try {
            const files = getFilesList(uploadDir);
            res.json(files);
        } catch (error) {
            console.error('Error reading files:', error);
            res.status(500).json({ error: 'Failed to read files' });
        }
    });

    app.post('/api/upload', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const clientIP = req.ip || req.connection.remoteAddress;
        // Ensure filename is properly encoded for display
        const decodedFilename = Buffer.from(req.file.filename, 'latin1').toString('utf8');
        const decodedOriginalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

        console.log(chalk.green(`✅ Upload complete: ${decodedFilename} from ${clientIP}`));

        res.json({
            message: 'File uploaded successfully',
            filename: decodedFilename,
            originalName: decodedOriginalName,
            size: req.file.size
        });
    });

    app.get('/api/download/:filename', (req, res) => {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const clientIP = req.ip || req.connection.remoteAddress;
        console.log(chalk.cyan(`📥 Download: ${filename} to ${clientIP}`));


        // Set the proper headers for the download
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file instead of using res.download for better handling of Unicode filenames
        fs.createReadStream(filePath).pipe(res);

    });

    app.delete('/api/files/:filename', (req, res) => {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(uploadDir, filename);

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                const clientIP = req.ip || req.connection.remoteAddress;
                console.log(chalk.yellow(`🗑️  Deleted: ${filename} by ${clientIP}`));
                res.json({ message: 'File deleted successfully' });
            } else {
                res.status(404).json({ error: 'File not found' });
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    });

    app.get('/api/info', (req, res) => {
        res.json({
            uploadDir: uploadDir,
            localIP: getLocalIP(),
            port: port,
            version: '1.0.0'
        });
    });
}

module.exports = { setupRoutes };