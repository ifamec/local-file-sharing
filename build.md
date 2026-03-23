# Local File Sharing - Build Instructions

The project has been rewritten from Node.js to Golang to provide a fast, single-binary execution without requiring a runtime pre-installed. 
Below are the build instructions to compile the project for different platforms.

## Prerequisites
1. Ensure you have [Go 1.21+](https://go.dev/dl/) installed.
2. Verify installation by running `go version` in your terminal.

## Initial Setup
If this is the first time you are building the project on a new machine, download the dependencies:

```bash
cd /path/to/local-file-sharing
go mod download
```

## Building the Executable
The application embeds the frontend static files into the executable itself so that you get a single, self-contained binary.

### Build for Windows:
```powershell
# In PowerShell
$env:GOOS="windows"; $env:GOARCH="amd64"; go build -ldflags="-s -w" -o dist/local-file-sharing-win.exe cmd/local-file-sharing/main.go

# Or using CMD:
set GOOS=windows
set GOARCH=amd64
go build -ldflags="-s -w" -o dist/local-file-sharing-win.exe cmd/local-file-sharing/main.go
```

### Build for macOS (Intel):
```bash
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o dist/local-file-sharing-macos-intel cmd/local-file-sharing/main.go
```

### Build for macOS (Apple Silicon):
```bash
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o dist/local-file-sharing-macos-arm64 cmd/local-file-sharing/main.go
```

### Build for Linux:
```bash
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o dist/local-file-sharing-linux cmd/local-file-sharing/main.go
```

*(Note: The `-ldflags="-s -w"` reduces the binary size by omitting debug information.)*

---

## Running the Server

Once built, you can run the executable directly.

```bash
# Windows
.\dist\local-file-sharing-win.exe --port 8080 --dir "$HOME\\SharedFiles" --open --qr

# macOS / Linux
./dist/local-file-sharing-macos-arm64 --port 8080 --dir ~/SharedFiles --open --qr
```

For full CLI options, use:
```bash
./dist/local-file-sharing-linux -h
```
