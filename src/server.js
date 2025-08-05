const express = require('express');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const open = require('open');
const path = require('path');
const { configureUpload } = require('./middleware/upload');
const { setupRoutes } = require('./routes/api');
const { ensureUploadDirectory } = require('./utils/fileSystem');
const { getLocalIP } = require('./utils/network');
const { getWebInterface } = require('./views/interface');

function startServer(options) {
    const PORT = parseInt(options.port);
    const UPLOAD_DIR = options.dir;

    ensureUploadDirectory(UPLOAD_DIR);
    const app = express();
    const upload = configureUpload(UPLOAD_DIR);

    // Properly serve static files from the public directory
    app.use(express.static(path.join(__dirname, 'public'), {
        setHeaders: (res, filePath) => {
            // Set correct MIME types
            if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            } else if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
        }
    }));

    // Debug middleware to log requests
    app.use((req, res, next) => {
        console.log(`${chalk.blue('Request:')} ${req.method} ${req.path}`);
        next();
    })


    app.get('/', (req, res) => {
        res.send(getWebInterface());
    });

    setupRoutes(app, UPLOAD_DIR, upload, PORT);

    const server = app.listen(PORT, '0.0.0.0', () => {
        displayServerInfo(PORT, UPLOAD_DIR, options);
    });

    setupErrorHandlers(server, PORT);
}

function displayServerInfo(PORT, UPLOAD_DIR, options) {
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
}

function setupErrorHandlers(server, PORT) {
    process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Shutting down server...'));
        server.close(() => {
            console.log(chalk.green('✅ Server stopped successfully'));
            process.exit(0);
        });
    });

    process.on('uncaughtException', (error) => {
        console.error(chalk.red('💥 Uncaught Exception:'), error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error(chalk.red('💥 Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
    });

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
}

module.exports = { startServer };