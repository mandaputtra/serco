package main

import (
	"context"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// FileNode represents a file or directory in the tree
type FileNode struct {
	Name     string      `json:"name"`
	Path     string      `json:"path"`
	IsDir    bool        `json:"isDir"`
	Size     int64       `json:"size"`
	ModTime  string      `json:"modTime"`
	Children []*FileNode `json:"children,omitempty"`
}

// NewApp creates a new App application struct
// NewApp 创建一个新的 App 应用程序
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
// startup 在应用程序启动时调用
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	// 在这里执行初始化设置
	a.ctx = ctx
}

// domReady is called after the front-end dom has been loaded
// domReady 在前端Dom加载完毕后调用
func (a *App) domReady(ctx context.Context) {
	// Add your action here
	// 在这里添加你的操作
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue,
// false will continue shutdown as normal.
// beforeClose在单击窗口关闭按钮或调用runtime.Quit即将退出应用程序时被调用.
// 返回 true 将导致应用程序继续，false 将继续正常关闭。
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
// 在应用程序终止时被调用
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
	// 在此处做一些资源释放的操作
}

// GetHomeDir returns the user's home directory
func (a *App) GetHomeDir() (string, error) {
	return os.UserHomeDir()
}

// ScanDirectory scans the given path and returns the file tree (non-recursive by default)
func (a *App) ScanDirectory(path string) (*FileNode, error) {
	runtime.LogDebugf(a.ctx, "Scanning directory: %s", path)

	// Use Lstat to avoid following symlinks automatically
	info, err := os.Lstat(path)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Failed to stat path %s: %v", path, err)
		return nil, err
	}

	root := &FileNode{
		Name:    info.Name(),
		Path:    path,
		IsDir:   info.IsDir(),
		Size:    info.Size(),
		ModTime: info.ModTime().Format(time.RFC3339),
	}

	// If it's a symlink that points to a directory, treat it as a directory
	if info.Mode()&os.ModeSymlink != 0 {
		resolvedPath, err := os.Readlink(path)
		if err == nil {
			resolvedInfo, err := os.Stat(resolvedPath)
			if err == nil && resolvedInfo.IsDir() {
				root.IsDir = true
			}
		}
	}

	if !root.IsDir {
		return root, nil
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Failed to read dir %s: %v", path, err)
		// Return what we have so far
		return root, nil
	}

	// Sort entries: directories first, then files
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir()
		}
		return entries[i].Name() < entries[j].Name()
	})

	for _, entry := range entries {
		childInfo, err := entry.Info()
		if err != nil {
			continue
		}

		childNode := &FileNode{
			Name:    entry.Name(),
			Path:    filepath.Join(path, entry.Name()),
			IsDir:   entry.IsDir(),
			Size:    childInfo.Size(),
			ModTime: childInfo.ModTime().Format(time.RFC3339),
		}
		// Initialize empty children array for directories so frontend knows it can be expanded
		if childNode.IsDir {
			childNode.Children = []*FileNode{}
		}

		root.Children = append(root.Children, childNode)
	}

	runtime.LogDebugf(a.ctx, "Scan complete for %s. Found %d items.", path, len(root.Children))
	return root, nil
}

// SearchFiles searches for files matching the query within the given root path (recursive with depth limit)
func (a *App) SearchFiles(query string, rootPath string) ([]*FileNode, error) {
	var results []*FileNode

	// Simple depth-limited walker
	// var walk func(string, int)
	// walk = func(currentPath string, depth int) {
	// 	if depth > 10 { // Hard depth limit
	// 		return
	// 	}

	// 	entries, err := os.ReadDir(currentPath)
	// 	if err != nil {
	// 		return
	// 	}

	// 	for _, entry := range entries {
	// 		// Check match
	// 		// Note: This is a simple case-insensitive substring match
	// 		// In a real app, you might want more robust matching
	// 		matched := false
	// 		// Check logic here...
	// 		_ = matched

	// 		// Recursion logic...
	// 	}
	// }

	// Placeholder implementation for search - to be expanded if needed
	return results, nil
}
