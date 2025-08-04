# Local File Sharing Server

A standalone server application that allows file sharing across your local network through any web browser. No installation required on client devices!

## 🚀 Quick Start

### Download & Run (Easiest)
1. Download the executable for your platform from releases
2. Run it: `./file-sharing-server-linux` (or double-click on Windows/macOS)
3. Open browser to the displayed URL
4. Share the network URL with other devices

### From Source
```bash
# Clone or download the project
git clone <your-repo-url>
cd local-file-sharing-server

# Install dependencies
npm install

# Run the server
npm start
```

## 📦 Building Standalone Executables

### Prerequisites
- Node.js (v16 or higher)
- npm

### Build Process
```bash
# Install dependencies
npm install

# Build for all platforms
chmod +x build.sh
./build.sh

# Or build manually
npm run build:all
```

### Output Files
After building, you'll find these executables in the `dist/` folder:
- `file-sharing-server-win.exe` - Windows executable (~50MB)
- `file-sharing-server-macos` - macOS executable (~50MB)
- `file-sharing-server-linux` - Linux executable (~50MB)

## 🎯 Features

### Server Features
- **Zero-config setup** - Just run and go
- **Cross-platform** - Works on Windows, macOS, Linux
- **Command-line interface** - Flexible configuration options
- **Beautiful console output** - Colorful, informative logging
- **QR code support** - Easy mobile device access
- **Auto-browser opening** - Convenience feature
- **Graceful shutdown** - Clean server stop with Ctrl+C

### Web Interface Features
- **Drag & drop upload** - Intuitive file sharing
- **Progress indicators** - Visual upload feedback
- **File management** - View, download, delete files
- **Responsive design** - Works on all devices
- **Real-time updates** - Automatic file list refresh
- **Large file support** - Up to 1GB per file

## 🛠️ Usage Options

### Basic Usage
```bash