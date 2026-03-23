package utils

import (
	"fmt"
	"math"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/fatih/color"
)

type FileInfo struct {
	Name          string    `json:"name"`
	Size          int64     `json:"size"`
	Modified      time.Time `json:"modified"`
	SizeFormatted string    `json:"sizeFormatted"`
}

func FormatFileSize(bytes int64) string {
	if bytes == 0 {
		return "0 Bytes"
	}
	k := 1024.0
	sizes := []string{"Bytes", "KB", "MB", "GB"}
	i := math.Floor(math.Log(float64(bytes)) / math.Log(k))
	return fmt.Sprintf("%.2f %s", float64(bytes)/math.Pow(k, i), sizes[int(i)])
}

func EnsureUploadDirectory(uploadDir string) {
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		err := os.MkdirAll(uploadDir, os.ModePerm)
		if err == nil {
			fmt.Println(color.GreenString("✅ Created upload directory: %s", uploadDir))
		}
	}
}

func GetFilesList(uploadDir string) []FileInfo {
	entries, err := os.ReadDir(uploadDir)
	if err != nil {
		return []FileInfo{}
	}

	var files []FileInfo
	for _, entry := range entries {
		if entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}
		info, err := entry.Info()
		if err == nil {
			files = append(files, FileInfo{
				Name:          info.Name(),
				Size:          info.Size(),
				Modified:      info.ModTime(),
				SizeFormatted: FormatFileSize(info.Size()),
			})
		}
	}

	// Sort by modification time, newest first
	sort.Slice(files, func(i, j int) bool {
		return files[j].Modified.Before(files[i].Modified)
	})

	// Ensure we return an empty array instead of null for JSON serialization
	if files == nil {
		return make([]FileInfo, 0)
	}
	return files
}
