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
# Run with default settings
./file-sharing-server-linux

# Windows
file-sharing-server-win.exe

# macOS
./file-sharing-server-macos
```

### Advanced Usage
```bash
# Custom port
./file-sharing-server-linux --port 8080

# Custom upload directory
./file-sharing-server-linux --dir ~/MySharedFiles

# Show QR code for mobile access
./file-sharing-server-linux --qr

# Don't auto-open browser
./file-sharing-server-linux --no-browser

# Combine options
./file-sharing-server-linux --port 8080 --dir ~/Documents/Shared --qr
```

### Command Line Options
```
Options:
  -V, --version          output the version number
  -p, --port <number>    port to run the server on (default: "3000")
  -d, --dir <path>       upload directory path (default: "~/SharedFiles")
  -o, --open             automatically open browser (default: true)
  -q, --qr               show QR code for mobile access
  --no-browser           disable browser auto-opening
  -h, --help             display help for command
```

## 🌐 Network Access

### For Users on Host Machine
- Open browser to: `http://localhost:3000`

### For Other Devices on Network
- Use the network URL displayed in console: `http://192.168.1.100:3000`
- Scan QR code if `--qr` option is used
- Works on phones, tablets, other computers

### File Storage
- Default location: `~/SharedFiles/` (user's home directory)
- Custom location: Use `--dir` option
- Files persist between server restarts
- Organized by upload time (newest first)

## 🔧 Installation Methods

### Method 1: Standalone Executable (Recommended)
- Download from releases
- No Node.js installation required
- Single file, ready to run
- Perfect for end users

### Method 2: Global NPM Package
```bash
# Install globally
npm install -g .

# Run from anywhere
file-share --port 3000 --qr
```

### Method 3: Run from Source
```bash
# Development/testing
npm install
npm start

# With options
npm start -- --port 8080 --qr
```

## 🎨 Customization

### Modify Default Settings
Edit `app.js` to change:
- Default port
- Default upload directory
- File size limits
- UI colors and styling

### Custom Branding
- Replace the web interface HTML in `getWebInterface()`
- Add your logo and colors
- Customize the header and messaging

### Extended Features
Add new functionality:
- User authentication
- File encryption
- Upload history
- File expiration
- Bandwidth limiting

## 🔒 Security Considerations

### Local Network Only
- Server binds to all interfaces (`0.0.0.0`)
- Intended for trusted local networks only
- No built-in authentication

### Production Considerations
For production use, consider adding:
- User authentication
- HTTPS/SSL certificates
- Rate limiting
- File scanning
- Access logging

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Try a different port
./file-sharing-server-linux --port 3001
```

**Permission Denied (Linux/macOS)**
```bash
# Make executable
chmod +x file-sharing-server-linux
```
On macOS, if prompt shows "file-sharing-server-macos" Not Opened:
> Go to `System Settings` -> `Privacy & Security`.  
> In "Security" section, check `"file-sharing-server-macos" was blocked to protect`.  
> Click `Allow Anyway` and try executing the app again.  
> Select `Open Anyway` in the prompt.

**Firewall Blocking Access**
- Windows: Allow through Windows Firewall
- macOS: System Preferences > Security & Privacy > Firewall
- Linux: Configure iptables/ufw as needed

**Can't Access from Other Devices**
- Ensure devices are on same network
- Check firewall settings
- Verify IP address is correct
- Try disabling VPN if active

### Debug Mode
```bash
# Enable verbose logging
NODE_ENV=development ./file-sharing-server-linux
```

## 📊 Performance

### File Size Limits
- Default: 1GB per file
- Configurable in source code
- Depends on available disk space

### Concurrent Users
- Handles multiple simultaneous uploads/downloads
- Performance depends on network and hardware
- Tested with 10+ concurrent users

### Memory Usage
- Lightweight: ~50MB RAM usage
- Scales with number of concurrent operations
- Files are streamed, not loaded into memory

## 🤝 Contributing

### Development Setup
```bash
git clone <repo-url>
cd local-file-sharing-server
npm install
npm run dev  # Auto-restart on changes
```

### Building
```bash
npm run build:all    # All platforms
npm run build:win    # Windows only
npm run build:mac    # macOS only
npm run build:linux  # Linux only
```

### Testing
```bash
npm test            # Run basic tests
npm start -- --help # Test CLI interface
```

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

- Create issues for bugs or feature requests
- Check existing issues before creating new ones
- Provide system info and error messages for bug reports

## 🚀 Future Features

Planned enhancements:
- [ ] User authentication
- [ ] File encryption
- [ ] Thumbnail generation for images
- [ ] File preview in browser
- [ ] Upload history and analytics
- [ ] Automatic file cleanup
- [ ] Mobile app companion
- [ ] Docker container support

---

**Made with ❤️ for easy local file sharing**