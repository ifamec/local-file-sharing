function getWebInterface() {
    // Move the entire HTML template here
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
</html>`;// (Keep the existing HTML content)
}

module.exports = { getWebInterface };