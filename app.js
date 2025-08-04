#!/usr/bin/env node

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { program } = require('commander');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const open = require('open');

// CLI Configuration
program
    .version('1.0.0')
    .description('Local File Sharing Server')
    .option('-p, --port <number>', 'port to run the server on', '3000')
    .option('-d, --dir <path>', 'upload directory path', path.join(os.homedir(), 'SharedFiles'))
    .option('-o, --open', 'automatically open browser')
    .option('-q, --qr', 'show QR code for mobile access')
    .option('--no-browser', 'disable browser auto-opening')
    .parse();

const options = program.opts();
const PORT = parseInt(options.port);
const UPLOAD_DIR = path.resolve(options.dir);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(chalk.green(`✅ Created upload directory: ${UPLOAD_DIR}`));
}

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Keep original filename, add timestamp if file exists
        const originalName = file.originalname;
        const filePath = path.join(UPLOAD_DIR, originalName);

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

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 // 1GB limit
    },
    fileFilter: (req, file, cb) => {
        // Log upload attempts
        console.log(chalk.blue(`📤 Uploading: ${file.originalname} (${formatFileSize(file.size || 0)})`));
        cb(null, true);
    }
});

// Serve the web interface
app.get('/', (req, res) => {
    res.send(getWebInterface());
});

// API Routes
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(UPLOAD_DIR)
            .filter(filename => {
                // Filter out hidden files and directories
                return !filename.startsWith('.') && fs.statSync(path.join(UPLOAD_DIR, filename)).isFile();
            })
            .map(filename => {
                const filePath = path.join(UPLOAD_DIR, filename);
                const stats = fs.statSync(filePath);
                return {
                    name: filename,
                    size: stats.size,
                    modified: stats.mtime,
                    sizeFormatted: formatFileSize(stats.size)
                };
            })
            .sort((a, b) => new Date(b.modified) - new Date(a.modified)); // Sort by newest first

        res.json(files);
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: 'Failed to read files' });
    }
});

// Upload file with progress logging
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

// Download file
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(chalk.cyan(`📥 Download: ${filename} to ${clientIP}`));

    res.download(filePath, filename);
});

// Delete file
app.delete('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

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

// Server info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        uploadDir: UPLOAD_DIR,
        localIP: getLocalIP(),
        port: PORT,
        version: '1.0.0'
    });
});

// Helper Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

function getWebInterface() {
    // Return the HTML interface inline (your existing index.html content)
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local File Sharing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 300; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .content { padding: 40px; }
        .upload-section { margin-bottom: 40px; }
        .upload-area { border: 3px dashed #ddd; border-radius: 15px; padding: 60px 20px; text-align: center; transition: all 0.3s ease; cursor: pointer; background: #fafafa; }
        .upload-area.dragover { border-color: #667eea; background: #f0f4ff; transform: scale(1.02); }
        .upload-area:hover { border-color: #667eea; background: #f8f9ff; }
        .upload-icon { font-size: 4rem; color: #ddd; margin-bottom: 20px; transition: color 0.3s ease; }
        .upload-area:hover .upload-icon { color: #667eea; }
        .upload-text { font-size: 1.2rem; color: #666; margin-bottom: 15px; }
        .upload-subtext { color: #999; font-size: 0.9rem; }
        #fileInput { display: none; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; font-size: 1rem; transition: transform 0.2s ease; margin-top: 15px; }
        .btn:hover { transform: translateY(-2px); }
        .files-section { margin-top: 40px; }
        .section-title { font-size: 1.5rem; color: #333; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .file-card { background: white; border: 1px solid #eee; border-radius: 12px; padding: 20px; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .file-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .file-name { font-weight: 600; color: #333; margin-bottom: 8px; word-break: break-all; }
        .file-info { color: #666; font-size: 0.85rem; margin-bottom: 15px; }
        .file-actions { display: flex; gap: 10px; }
        .btn-small { padding: 8px 16px; font-size: 0.85rem; border-radius: 20px; border: none; cursor: pointer; transition: all 0.2s ease; }
        .btn-download { background: #10b981; color: white; }
        .btn-download:hover { background: #059669; }
        .btn-delete { background: #ef4444; color: white; }
        .btn-delete:hover { background: #dc2626; }
        .progress-bar { width: 100%; height: 4px; background: #eee; border-radius: 2px; overflow: hidden; margin: 20px 0; display: none; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); width: 0%; transition: width 0.3s ease; }
        .notification { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 10px; color: white; font-weight: 500; z-index: 1000; transform: translateX(400px); transition: transform 0.3s ease; }
        .notification.show { transform: translateX(0); }
        .notification.success { background: #10b981; }
        .notification.error { background: #ef4444; }
        .empty-state { text-align: center; padding: 60px 20px; color: #999; }
        .empty-icon { font-size: 3rem; margin-bottom: 20px; }
        @media (max-width: 768px) { .container { margin: 10px; border-radius: 15px; } .header { padding: 20px; } .header h1 { font-size: 2rem; } .content { padding: 20px; } .upload-area { padding: 40px 15px; } .file-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📁 Local File Sharing</h1>
            <p>Drop files to share across your local network</p>
        </div>
        <div class="content">
            <div class="upload-section">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-icon">📁</div>
                    <div class="upload-text">Drop files here or click to browse</div>
                    <div class="upload-subtext">All file types supported • Max 1GB per file</div>
                    <button class="btn" onclick="document.getElementById('fileInput').click()">Choose Files</button>
                </div>
                <input type="file" id="fileInput" multiple>
                <div class="progress-bar" id="progressBar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>
            <div class="files-section">
                <div class="section-title">
                    <span>📋</span><span>Shared Files</span>
                    <button class="btn-small" onclick="refreshFiles()" style="margin-left: auto; background: #6366f1; color: white;">🔄 Refresh</button>
                </div>
                <div class="file-grid" id="fileGrid"></div>
            </div>
        </div>
    </div>
    <script>
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileGrid = document.getElementById('fileGrid');
        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => { uploadArea.classList.remove('dragover'); });
        uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
        uploadArea.addEventListener('click', () => { fileInput.click(); });
        fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); });
        
        async function handleFiles(files) { for (let file of files) { await uploadFile(file); } refreshFiles(); }
        
        async function uploadFile(file) {
            const formData = new FormData(); formData.append('file', file);
            try {
                progressBar.style.display = 'block'; progressFill.style.width = '0%';
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', (e) => { if (e.lengthComputable) { progressFill.style.width = (e.loaded / e.total) * 100 + '%'; } });
                xhr.onload = function() { progressBar.style.display = 'none'; showNotification(xhr.status === 200 ? 'File uploaded successfully!' : 'Upload failed!', xhr.status === 200 ? 'success' : 'error'); };
                xhr.open('POST', '/api/upload'); xhr.send(formData);
            } catch (error) { progressBar.style.display = 'none'; showNotification('Upload failed!', 'error'); }
        }
        
        async function refreshFiles() {
            try { const response = await fetch('/api/files'); displayFiles(await response.json()); } catch (error) { console.error('Failed to load files:', error); }
        }
        
        function displayFiles(files) {
            if (files.length === 0) { fileGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">📂</div><div>No files shared yet</div><div style="font-size: 0.85rem; margin-top: 10px;">Upload files to get started</div></div>'; return; }
            fileGrid.innerHTML = files.map(file => \`<div class="file-card"><div class="file-name">\${file.name}</div><div class="file-info">\${file.sizeFormatted} • \${new Date(file.modified).toLocaleString()}</div><div class="file-actions"><button class="btn-small btn-download" onclick="downloadFile('\${file.name}')">⬇️ Download</button><button class="btn-small btn-delete" onclick="deleteFile('\${file.name}')">🗑️ Delete</button></div></div>\`).join('');
        }
        
        function downloadFile(filename) { window.open(\`/api/download/\${encodeURIComponent(filename)}\`, '_blank'); }
        
        async function deleteFile(filename) {
            if (confirm(\`Are you sure you want to delete "\${filename}"?\`)) {
                try { const response = await fetch(\`/api/files/\${encodeURIComponent(filename)}\`, { method: 'DELETE' }); showNotification(response.ok ? 'File deleted successfully!' : 'Failed to delete file!', response.ok ? 'success' : 'error'); if (response.ok) refreshFiles(); } catch (error) { showNotification('Failed to delete file!', 'error'); }
            }
        }
        
        function showNotification(message, type) {
            const notification = document.createElement('div'); notification.className = \`notification \${type}\`; notification.textContent = message; document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100); setTimeout(() => { notification.classList.remove('show'); setTimeout(() => document.body.removeChild(notification), 300); }, 3000);
        }
        
        refreshFiles(); setInterval(refreshFiles, 10000);
    </script>
</body>
</html>`;
}

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    const localURL = `http://localhost:${PORT}`;
    const networkURL = `http://${localIP}:${PORT}`;

    console.clear();
    console.log(chalk.bold.blue('🚀 Local File Sharing Server'));
    console.log(chalk.gray('═══════════════════════════════════════'));
    console.log();
    console.log(chalk.green('✅ Server running successfully!'));
    console.log();
    console.log(chalk.yellow('📂 Upload Directory:'));
    console.log(chalk.white(`   ${UPLOAD_DIR}`));
    console.log();
    console.log(chalk.yellow('🌐 Access URLs:'));
    console.log(chalk.white(`   Local:   ${localURL}`));
    console.log(chalk.white(`   Network: ${networkURL}`));
    console.log();
    console.log(chalk.cyan('📱 Share the network URL with other devices on your local network'));
    console.log();

    if (options.qr) {
        console.log(chalk.yellow('📱 QR Code for mobile access:'));
        qrcode.generate(networkURL, { small: true });
        console.log();
    }

    if (options.open !== false) {
        console.log(chalk.gray('Opening browser...'));
        open(localURL).catch(() => {
            console.log(chalk.yellow('⚠️  Could not automatically open browser'));
        });
    }

    console.log(chalk.gray('Press Ctrl+C to stop the server'));
    console.log(chalk.gray('═══════════════════════════════════════'));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down server...'));
    server.close(() => {
        console.log(chalk.green('✅ Server stopped successfully'));
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error(chalk.red('💥 Uncaught Exception:'), error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('💥 Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
});

// Handle port in use
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(chalk.red(`❌ Port ${PORT} is already in use`));
        console.log(chalk.yellow('💡 Try a different port: npm start -- --port 3001'));
        process.exit(1);
    } else {
        console.error(chalk.red('❌ Server error:'), error);
        process.exit(1);
    }
});