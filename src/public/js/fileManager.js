let currentLayout = 'list';
let currentSort = 'time_desc';
let allFiles = []; // Store globally for client-side sorting

/**
 * Fetches and displays the list of files from the server
 */
async function refreshFiles() {
    try {
        const response = await fetch('/api/files', { cache: 'no-store' });
        const files = await response.json();
        
        // Prevent unnecessary DOM rendering if payload hasn't fundamentally changed, 
        // unless layout/sort states just changed. (Handled via renderFiles wrapper)
        const newFilesStr = JSON.stringify(files);
        if (window.lastFilesStr !== newFilesStr) {
            window.lastFilesStr = newFilesStr;
            allFiles = files;
            renderFiles();
        }
    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

/**
 * Re-sorts and re-renders from global allFiles array
 */
function renderFiles() {
    // 1. Sort the files
    const sorted = [...allFiles].sort((a, b) => {
        if (currentSort === 'time_desc') return new Date(b.modified) - new Date(a.modified);
        if (currentSort === 'time_asc') return new Date(a.modified) - new Date(b.modified);
        if (currentSort === 'size_desc') return b.size - a.size;
        if (currentSort === 'size_asc') return a.size - b.size;
        if (currentSort === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
    });

    const fileGrid = document.getElementById('fileGrid');
    
    // Apply layout class
    fileGrid.className = `files-container ${currentLayout}-view`;

    if (sorted.length === 0) {
        fileGrid.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 20px; color:#d2e3fc;" class="material-icons-outlined">folder_open</div>
                <div>No files in My Drive</div>
                <div style="font-size: 13px; margin-top: 8px;">Upload or drop files here to add them to your Local Drive</div>
            </div>
        `;
        return;
    }

    if (currentLayout === 'list') {
        fileGrid.innerHTML = `
            <div class="file-card" style="font-weight: 500; border-bottom: 2px solid #e0e0e0; cursor: default; position: sticky; top: 0; background: var(--bg-white); z-index: 10;">
                <div>Name</div>
                <div>Size</div>
                <div>Modified</div>
                <div></div>
            </div>
            ${sorted.map(file => `
                <div class="file-card" onclick="downloadFile('${file.name}')">
                    <div class="file-name-col">
                        <span class="material-icons-outlined file-icon-small">insert_drive_file</span>
                        ${file.name}
                    </div>
                    <div>${file.sizeFormatted}</div>
                    <div>${new Date(file.modified).toLocaleDateString()}</div>
                    <div class="file-actions" onclick="event.stopPropagation()">
                        <button class="card-btn" onclick="downloadFile('${file.name}')" title="Download"><span class="material-icons-outlined" style="font-size: 18px;">download</span></button>
                        <button class="card-btn" onclick="deleteFile('${file.name}')" title="Delete"><span class="material-icons-outlined" style="font-size: 18px; color: #d93025;">delete</span></button>
                    </div>
                </div>
            `).join('')}
        `;
    } else {
        // Grid view
        fileGrid.innerHTML = sorted.map(file => `
            <div class="file-card" onclick="downloadFile('${file.name}')">
                <div class="file-name-col">${file.name}</div>
                <div class="file-icon-big">
                    <span class="material-icons-outlined">insert_drive_file</span>
                </div>
                <div class="file-details-col">
                    <span>${new Date(file.modified).toLocaleDateString()}</span>
                    <span>${file.sizeFormatted}</span>
                </div>
                <div class="file-actions" onclick="event.stopPropagation()">
                    <button class="card-btn" onclick="downloadFile('${file.name}')" title="Download"><span class="material-icons-outlined" style="font-size: 18px;">download</span></button>
                    <button class="card-btn" onclick="deleteFile('${file.name}')" title="Delete"><span class="material-icons-outlined" style="font-size: 18px; color: #d93025;">delete</span></button>
                </div>
            </div>
        `).join('');
    }
}

function downloadFile(filename) {
    window.open(`/api/download/${encodeURIComponent(filename)}`, '_blank');
}

async function deleteFile(filename) {
    if (confirm(`Move "${filename}" to trash?`)) {
        try {
            const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            showNotification(
                response.ok ? 'File deleted' : 'Error deleting file',
                response.ok ? 'success' : 'error'
            );

            if (response.ok) refreshFiles();
        } catch (error) {
            showNotification('Error deleting file', 'error');
        }
    }
}

// Ensure layout functions are attached globally if needed by app.js (they are part of module space)
window.updateLayout = function(layout) {
    currentLayout = layout;
    renderFiles();
};

window.updateSort = function(sortVal) {
    currentSort = sortVal;
    renderFiles();
};

// Expose refreshFiles to app.js
window.refreshFiles = refreshFiles;