const fs = require('fs');
const path = require('path');

function getWebInterface() {
    // Return the HTML template directly from the file
    return fs.readFileSync(path.join(__dirname, '../public', 'index.html'), 'utf8');
}

module.exports = { getWebInterface };