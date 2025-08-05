// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileGrid = document.getElementById('fileGrid');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const refreshBtn = document.getElementById('refreshBtn');

// Setup event listeners
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
    handleFiles(e.dataTransfer.files);
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

refreshBtn.addEventListener('click', refreshFiles);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Initial file refresh
    refreshFiles();

    // Set up auto-refresh every 10 seconds
    setInterval(refreshFiles, 10000);
});