const express = require('express');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { getFilesList } = require('../utils/fileSystem');
const { getLocalIP } = require('../utils/network');

function setupRoutes(app, uploadDir, upload, port) {
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
        console.log(chalk.green(`✅ Upload complete: ${req.file.filename} from ${clientIP}`));

        res.json({
            message: 'File uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });
    });

    app.get('/api/download/:filename', (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const clientIP = req.ip || req.connection.remoteAddress;
        console.log(chalk.cyan(`📥 Download: ${filename} to ${clientIP}`));

        res.download(filePath, filename);
    });

    app.delete('/api/files/:filename', (req, res) => {
        const filename = req.params.filename;
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