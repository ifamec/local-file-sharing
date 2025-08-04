const { program } = require('commander');
const path = require('path');
const os = require('os');

function setupCLI() {
    program
        .version('1.0.0')
        .description('Local File Sharing Server')
        .option('-p, --port <number>', 'port to run the server on', '3000')
        .option('-d, --dir <path>', 'upload directory path', path.join(os.homedir(), 'SharedFiles'))
        .option('-o, --open', 'automatically open browser')
        .option('-q, --qr', 'show QR code for mobile access')
        .option('--no-browser', 'disable browser auto-opening')
        .parse(process.argv);

    return program.opts();
}

module.exports = { setupCLI };