package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"os/user"
	"path/filepath"

	"local-file-sharing/internal/api"
	"local-file-sharing/internal/utils"

	"github.com/gorilla/mux"
)

//go:embed src/public
var embedStatic embed.FS

func main() {
	var port int
	var dir string
	var openBrowser bool
	var showQR bool
	var noBrowser bool

	// Default directory logic
	usr, _ := user.Current()
	defaultDir := filepath.Join(usr.HomeDir, "SharedFiles")

	flag.IntVar(&port, "p", 3000, "port to run the server on")
	flag.IntVar(&port, "port", 3000, "port to run the server on")
	flag.StringVar(&dir, "d", defaultDir, "upload directory path")
	flag.StringVar(&dir, "dir", defaultDir, "upload directory path")
	flag.BoolVar(&openBrowser, "o", false, "automatically open browser")
	flag.BoolVar(&openBrowser, "open", false, "automatically open browser")
	flag.BoolVar(&showQR, "q", false, "show QR code for mobile access")
	flag.BoolVar(&showQR, "qr", false, "show QR code for mobile access")
	flag.BoolVar(&noBrowser, "no-browser", false, "disable browser auto-opening")
	flag.Parse()

	if noBrowser {
		openBrowser = false
	}

	options := utils.ServerOptions{
		Port:        port,
		Dir:         dir,
		OpenBrowser: openBrowser,
		ShowQR:      showQR,
	}

	utils.EnsureUploadDirectory(options.Dir)

	r := mux.NewRouter()

	// Setup API routes
	apiHandler := api.NewAPIHandler(options.Dir, options.Port)
	apiHandler.RegisterRoutes(r)

	// Serve static files from embedded FS
	subFS, err := fs.Sub(embedStatic, "src/public")
	if err != nil {
		fmt.Printf("Error loading embedded static files: %v\n", err)
		os.Exit(1)
	}

	// Serve the static files at root
	r.PathPrefix("/").Handler(http.FileServer(http.FS(subFS)))

	// Setup server and error handling
	utils.SetupErrorHandlers()

	utils.DisplayServerInfo(options)

	addr := fmt.Sprintf("0.0.0.0:%d", options.Port)
	if err := http.ListenAndServe(addr, r); err != nil {
		fmt.Printf("\n❌ Server error: %v\n", err)
		os.Exit(1)
	}
}
