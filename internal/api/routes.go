package api

import (
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"local-file-sharing/internal/utils"

	"github.com/fatih/color"
	"github.com/gorilla/mux"
)

type APIHandler struct {
	UploadDir string
	Port      int
}

func NewAPIHandler(uploadDir string, port int) *APIHandler {
	return &APIHandler{
		UploadDir: uploadDir,
		Port:      port,
	}
}

func (h *APIHandler) RegisterRoutes(r *mux.Router) {
	api := r.PathPrefix("/api").Subrouter()

	api.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			next.ServeHTTP(w, r)
		})
	})

	api.HandleFunc("/files", h.GetFiles).Methods("GET")
	api.HandleFunc("/upload", h.UploadFile).Methods("POST")
	api.HandleFunc("/download/{filename}", h.DownloadFile).Methods("GET")
	api.HandleFunc("/files/{filename}", h.DeleteFile).Methods("DELETE")
	api.HandleFunc("/info", h.GetInfo).Methods("GET")
}

func (h *APIHandler) GetFiles(w http.ResponseWriter, r *http.Request) {
	files := utils.GetFilesList(h.UploadDir)
	json.NewEncoder(w).Encode(files)
}

func (h *APIHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Parse max 1GB
	err := r.ParseMultipartForm(1024 << 20)
	if err != nil {
		http.Error(w, `{"error": "Failed to parse form"}`, http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error": "No file uploaded"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	originalName := handler.Filename
	clientIP := getClientIP(r)

	fmt.Println(color.BlueString("📤 Uploading: %s (%s)", originalName, utils.FormatFileSize(handler.Size)))

	filePath := filepath.Join(h.UploadDir, originalName)
	if _, err := os.Stat(filePath); err == nil {
		// File exists, append timestamp
		ext := filepath.Ext(originalName)
		nameLine := originalName[0 : len(originalName)-len(ext)]
		timestamp := time.Now().UnixMilli()
		originalName = fmt.Sprintf("%s_%d%s", nameLine, timestamp, ext)
		filePath = filepath.Join(h.UploadDir, originalName)
	}

	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, `{"error": "Failed to save file"}`, http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, `{"error": "Failed to write file"}`, http.StatusInternalServerError)
		return
	}

	fmt.Println(color.GreenString("✅ Upload complete: %s from %s", originalName, clientIP))

	response := map[string]interface{}{
		"message":      "File uploaded successfully",
		"filename":     originalName,
		"originalName": handler.Filename,
		"size":         handler.Size,
	}
	json.NewEncoder(w).Encode(response)
}

func (h *APIHandler) DownloadFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	filename, err := url.PathUnescape(vars["filename"])
	if err != nil {
		filename = vars["filename"]
	}

	filePath := filepath.Join(h.UploadDir, filename)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, `{"error": "File not found"}`, http.StatusNotFound)
		return
	}

	clientIP := getClientIP(r)
	fmt.Println(color.CyanString("📥 Download: %s to %s", filename, clientIP))

	// Get file content type
	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Override JSON content type set by middleware
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename*=UTF-8''%s", url.PathEscape(filename)))

	http.ServeFile(w, r, filePath)
}

func (h *APIHandler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	filename, err := url.PathUnescape(vars["filename"])
	if err != nil {
		filename = vars["filename"]
	}

	filePath := filepath.Join(h.UploadDir, filename)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, `{"error": "File not found"}`, http.StatusNotFound)
		return
	}

	err = os.Remove(filePath)
	if err != nil {
		http.Error(w, `{"error": "Failed to delete file"}`, http.StatusInternalServerError)
		return
	}

	clientIP := getClientIP(r)
	fmt.Println(color.YellowString("🗑️  Deleted: %s by %s", filename, clientIP))

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "File deleted successfully"}`))
}

func (h *APIHandler) GetInfo(w http.ResponseWriter, r *http.Request) {
	info := map[string]interface{}{
		"uploadDir": h.UploadDir,
		"localIP":   utils.GetLocalIP(),
		"port":      h.Port,
		"version":   "1.0.0",
	}
	json.NewEncoder(w).Encode(info)
}

func getClientIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	return ip
}
