# Local File Sharing Server (Go Edition)

A lightning-fast, standalone server application that allows file sharing across your local network through any web browser. 

Recently rewritten from Node.js to **Golang**, this project now consists of a single self-contained executable binary. The modern, Google Drive-inspired frontend is embedded directly into the executable, meaning **no installation or runtimes are required on client devices or the host**.

## 🚀 Quick Start

### Pre-Compiled Binary
If you have a pre-compiled binary for your system (e.g. `local-file-sharing-win.exe`), simply double click it or run it from your terminal:

```powershell
# Windows
.\local-file-sharing-win.exe

# macOS / Linux
./local-file-sharing
```

### From Source (Requires Go 1.21+)
```bash
# Clone or download the project
git clone <your-repo-url>
cd local-file-sharing

# Download dependencies
go mod download

# Run the server directly
go run main.go
```

## 📦 Building Standalone Executables
For complete build instructions for Windows, macOS (Intel & Apple Silicon), and Linux, please read the included **[Build Instructions (build.md)](build.md)** file!

## 🎯 Features

### Server Features
- **Zero-config setup** - Just run and go!
- **Single Binary** - Frontend HTML/CSS/JS is cleanly embedded using `//go:embed`
- **Cross-platform** - Works natively on Windows, macOS, Linux
- **Command-line interface** - Port, directory, and UI configuration options
- **Beautiful console output** - Colorful, informative terminal logging
- **QR code support** - Instantly access your drive from a mobile device
- **Auto-browser opening** - Convenience feature on launch
- **Graceful shutdown** - Clean server stop with `Ctrl+C`

### Web Interface Features
- **Google Drive Aesthetics** - Beautiful, dynamic, modern layout
- **Drag & drop upload** - Intuitive file sharing region
- **Progress indicators** - Visual upload feedback
- **View Management** - Instantly toggle between Grid and List layouts
- **Dynamic Sorting** - Sort by modified date, size, and name
- **Real-time Engine** - The UI polls and refreshes seamlessly without flickering
- **Large file support** - Fast stream handling

## 🛠️ Configuration Options

```bash
# Custom port
go run main.go --port 8080

# Custom upload directory
go run main.go --dir "C:\MySharedFiles"

# Show QR code for mobile access
go run main.go --qr

# Auto-open browser
go run main.go --open

# Combine options
.\local-file-sharing-win.exe -p 8080 -d "D:\Transfer" --qr --open
```

### Command Line Flags
```
Options:
  -p, --port <number>    port to run the server on (default: 3000)
  -d, --dir <path>       upload directory path (default: user's Home SharedFiles folder)
  -o, --open             automatically open browser (default: false)
  -q, --qr               show QR code for mobile access
  --no-browser           disable browser auto-opening
```

## 🌐 Network Access

### For Users on Host Machine
- Open browser to: `http://localhost:3000` (or your chosen port)

### For Other Devices on Network
- Use the network URL displayed in console (e.g. `http://192.168.1.100:3000`)
- Scan QR code directly from the terminal if the `--qr` option is used
- Works perfectly on iOS, Android, and other computers!

## 🔒 Security Considerations

### Local Network Only
- Server binds to all interfaces (`0.0.0.0`)
- Intended for trusted local networks only
- No built-in user authentication

## 🐛 Troubleshooting

**Port Already in Use**
Run the server on a different port:
```bash
./local-file-sharing --port 3001
```

**Permission Denied (Linux/macOS)**
```bash
# Make executable
chmod +x local-file-sharing
```

**Firewall Blocking Access**
- Windows: Allow the executable through Windows Defender Firewall.
- macOS: System Preferences > Security & Privacy > Firewall.
- Linux: Configure iptables/ufw as needed to allow your port through.

## 📄 License
MIT License - feel free to use for personal or commercial projects.

---
**Made with ❤️ for easy local file sharing**