#!/bin/bash

# Build script for creating standalone executables

echo "🚀 Building Local File Sharing Server Executables"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if pkg is installed
if ! command -v pkg &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pkg (executable builder)...${NC}"
    npm install -g pkg
fi

# Create dist directory
mkdir -p dist

echo -e "${BLUE}🏗️  Building executables for all platforms...${NC}"

# Build for Windows
echo -e "${YELLOW}🪟 Building for Windows...${NC}"
pkg . --targets node18-win-x64 --output dist/file-sharing-server-win.exe
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Windows executable created: dist/file-sharing-server-win.exe${NC}"
else
    echo -e "${RED}❌ Windows build failed${NC}"
fi

# Build for macOS
echo -e "${YELLOW}🍎 Building for macOS...${NC}"
pkg . --targets node18-macos-x64 --output dist/file-sharing-server-macos
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ macOS executable created: dist/file-sharing-server-macos${NC}"
else
    echo -e "${RED}❌ macOS build failed${NC}"
fi

# Build for Linux
echo -e "${YELLOW}🐧 Building for Linux...${NC}"
pkg . --targets node18-linux-x64 --output dist/file-sharing-server-linux
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Linux executable created: dist/file-sharing-server-linux${NC}"
else
    echo -e "${RED}❌ Linux build failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Build process completed!${NC}"
echo ""
echo "📦 Your executables are in the 'dist' folder:"
echo "   • Windows: file-sharing-server-win.exe"
echo "   • macOS:   file-sharing-server-macos"
echo "   • Linux:   file-sharing-server-linux"
echo ""
echo "🚀 Usage examples:"
echo "   ./dist/file-sharing-server-linux"
echo "   ./dist/file-sharing-server-linux --port 8080"
echo "   ./dist/file-sharing-server-linux --dir ~/MySharedFiles --qr"
echo ""
echo -e "${BLUE}💡 Tip: Make executables globally available by copying to PATH${NC}"

# Make executables executable on Unix systems
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    chmod +x dist/file-sharing-server-*
    echo -e "${GREEN}✅ Made executables executable${NC}"
fi

# Show file sizes
echo ""
echo "📊 File sizes:"
ls -lh dist/file-sharing-server-* 2>/dev/null | awk '{print "   " $9 ": " $5}'

echo ""
echo -e "${YELLOW}🔧 Advanced usage:${NC}"
echo "   --port 3000        Set custom port"
echo "   --dir /path        Set upload directory"
echo "   --qr               Show QR code for mobile"
echo "   --no-browser       Don't auto-open browser"
echo "   --help             Show all options"