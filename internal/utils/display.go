package utils

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/fatih/color"
	"github.com/pkg/browser"
	"github.com/skip2/go-qrcode"
)

type ServerOptions struct {
	Port         int
	Dir          string
	OpenBrowser  bool
	ShowQR       bool
}

func DisplayServerInfo(options ServerOptions) {
	localIP := GetLocalIP()
	localURL := fmt.Sprintf("http://localhost:%d", options.Port)
	networkURL := fmt.Sprintf("http://%s:%d", localIP, options.Port)

	// ANSI clear screen equivalent (or just print newlines)
	fmt.Print("\033[H\033[2J")

	cBlueBold := color.New(color.FgBlue, color.Bold).SprintFunc()
	cGray := color.New(color.FgHiBlack).SprintFunc()
	cGreen := color.New(color.FgGreen).SprintFunc()
	cYellow := color.New(color.FgYellow).SprintFunc()
	cWhite := color.New(color.FgWhite).SprintFunc()
	cCyan := color.New(color.FgCyan).SprintFunc()

	fmt.Println(cBlueBold("🚀 Local File Sharing Server"))
	fmt.Println(cGray("═══════════════════════════════════════"))
	fmt.Println()
	fmt.Println(cGreen("✅ Server running successfully!"))
	fmt.Println()
	fmt.Println(cYellow("📂 Upload Directory:"))
	fmt.Println(cWhite(fmt.Sprintf("   %s", options.Dir)))
	fmt.Println()
	fmt.Println(cYellow("🌐 Access URLs:"))
	fmt.Println(cWhite(fmt.Sprintf("   Local:   %s", localURL)))
	fmt.Println(cWhite(fmt.Sprintf("   Network: %s", networkURL)))
	fmt.Println()
	fmt.Println(cCyan("📱 Share the network URL with other devices on your local network"))
	fmt.Println()

	if options.ShowQR {
		fmt.Println(cYellow("📱 QR Code for mobile access:"))
		// Print QR Code to console
		qr, err := qrcode.New(networkURL, qrcode.Low)
		if err == nil {
			fmt.Println(qr.ToSmallString(false))
		}
		fmt.Println()
	}

	if options.OpenBrowser {
		fmt.Println(cGray("Opening browser..."))
		err := browser.OpenURL(localURL)
		if err != nil {
			fmt.Println(cYellow("⚠️  Could not automatically open browser"))
		}
	}

	fmt.Println(cGray("Press Ctrl+C to stop the server"))
	fmt.Println(cGray("═══════════════════════════════════════"))
}

func SetupErrorHandlers() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		fmt.Println(color.YellowString("\n🛑 Shutting down server..."))
		fmt.Println(color.GreenString("✅ Server stopped successfully"))
		os.Exit(0)
	}()
}
