/**
 * Handles the upload of multiple files
 * @param {FileList} files - List of files to upload
 */
async function handleFiles(files) {
    for (let file of files) {
        await uploadFile(file);
    }
    refreshFiles();
}

/**
 * Uploads a single file to the server
 * @param {File} file - The file to upload
 */
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        progressBar.style.display = 'block';
        progressFill.style.width = '0%';

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                progressFill.style.width = (e.loaded / e.total) * 100 + '%';
            }
        });

        xhr.onload = function() {
            progressBar.style.display = 'none';
            showNotification(
                xhr.status === 200 ? 'File uploaded successfully!' : 'Upload failed!',
                xhr.status === 200 ? 'success' : 'error'
            );
        };

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    } catch (error) {
        progressBar.style.display = 'none';
        showNotification('Upload failed!', 'error');
    }
}