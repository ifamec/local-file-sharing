// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const btnNew = document.getElementById('btnNew');
const fileInput = document.getElementById('fileInput');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const refreshBtn = document.getElementById('refreshBtn');

const btnList = document.getElementById('btnList');
const btnGrid = document.getElementById('btnGrid');
const sortSelect = document.getElementById('sortSelect');

// Setup event listeners
function bindUploadTriggers() {
    const triggerUpload = () => fileInput.click();
    if (uploadArea) uploadArea.addEventListener('click', triggerUpload);
    if (btnNew) btnNew.addEventListener('click', triggerUpload);
}

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (typeof handleFiles === 'function') {
            handleFiles(e.dataTransfer.files);
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (typeof handleFiles === 'function') {
            handleFiles(e.target.files);
        }
    });
}

if (refreshBtn) refreshBtn.addEventListener('click', () => window.refreshFiles && window.refreshFiles());

// View toggles
if (btnList && btnGrid) {
    btnList.addEventListener('click', () => {
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
        if (window.updateLayout) window.updateLayout('list');
    });

    btnGrid.addEventListener('click', () => {
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
        if (window.updateLayout) window.updateLayout('grid');
    });
}

// Sort dropdown
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        if (window.updateSort) window.updateSort(e.target.value);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    bindUploadTriggers();
    
    // Initial file refresh
    if (window.refreshFiles) window.refreshFiles();

    // Set up auto-refresh every 2 seconds
    setInterval(() => {
        if (window.refreshFiles) window.refreshFiles();
    }, 2000);
});