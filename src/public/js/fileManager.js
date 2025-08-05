/**
 * Fetches and displays the list of files from the server
 */
async function refreshFiles() {
    try {
        const response = await fetch('/api/files');
        const files = await response.json();
        displayFiles(files);
    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

/**
 * Displays the list of files in the file grid
 * @param {Array} files - List of file objects
 */
function displayFiles(files) {
    if (files.length === 0) {
        fileGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📂</div>
                <div>No files shared yet</div>
                <div style="font-size: 0.85rem; margin-top: 10px;">Upload files to get started</div>
            </div>
        `;
        return;
    }

    fileGrid.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="file-name">${file.name}</div>
            <div class="file-info">${file.sizeFormatted} • ${new Date(file.modified).toLocaleString()}</div>
            <div class="file-actions">
                <button class="btn-small btn-download" onclick="downloadFile('${file.name}')">⬇️ Download</button>
                <button class="btn-small btn-delete" onclick="deleteFile('${file.name}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Downloads a file
 * @param {string} filename - Name of the file to download
 */
function downloadFile(filename) {
    window.open(`/api/download/${encodeURIComponent(filename)}`, '_blank');
}

/**
 * Deletes a file
 * @param {string} filename - Name of the file to delete
 */
async function deleteFile(filename) {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
        try {
            const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            showNotification(
                response.ok ? 'File deleted successfully!' : 'Failed to delete file!',
                response.ok ? 'success' : 'error'
            );

            if (response.ok) refreshFiles();
        } catch (error) {
            showNotification('Failed to delete file!', 'error');
        }
    }
}