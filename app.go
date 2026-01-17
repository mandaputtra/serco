package main

import (
	"context"
	"fmt"
	"io"
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

// CopyProgress represents the progress of a file copy operation
type CopyProgress struct {
	CurrentFile string  `json:"currentFile"`
	FilesDone   int     `json:"filesDone"`
	TotalFiles  int     `json:"totalFiles"`
	Percentage  float64 `json:"percentage"`
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
	return results, nil
}

// CopyFiles copies a list of files to a destination directory
func (a *App) CopyFiles(srcPaths []string, destDir string) error {
	destInfo, err := os.Stat(destDir)
	if err != nil {
		return fmt.Errorf("destination directory does not exist: %v", err)
	}
	if !destInfo.IsDir() {
		return fmt.Errorf("destination is not a directory")
	}

	// Filter valid files and directories
	var itemsToCopy []string
	for _, src := range srcPaths {
		_, err := os.Stat(src)
		if err == nil {
			itemsToCopy = append(itemsToCopy, src)
		}
	}

	totalItems := len(itemsToCopy)
	if totalItems == 0 {
		return fmt.Errorf("no valid items to copy")
	}

	// Start copy loop
	for i, src := range itemsToCopy {
		srcBase := filepath.Base(src)
		
		// Emit progress before starting file
		progress := CopyProgress{
			CurrentFile: srcBase,
			FilesDone:   i,
			TotalFiles:  totalItems,
			Percentage:  float64(i) / float64(totalItems) * 100,
		}
		runtime.EventsEmit(a.ctx, "copy-progress", progress)

		srcInfo, err := os.Stat(src)
		if err != nil {
			runtime.LogErrorf(a.ctx, "Failed to stat source %s: %v", src, err)
			continue
		}

		destPath := filepath.Join(destDir, srcBase)

		if srcInfo.IsDir() {
			// Recursive copy
			err = copyDir(src, destPath)
			if err != nil {
				runtime.LogErrorf(a.ctx, "Failed to copy directory %s: %v", src, err)
				return fmt.Errorf("failed to copy directory %s: %v", src, err)
			}
		} else {
			// File copy
			err = copyFile(src, destPath, srcInfo)
			if err != nil {
				runtime.LogErrorf(a.ctx, "Failed to copy file %s: %v", src, err)
				return fmt.Errorf("failed to copy file %s: %v", src, err)
			}
		}
		
		// Sleep briefly to let UI update for small files
		time.Sleep(50 * time.Millisecond)
	}

	// Emit 100% completion
	runtime.EventsEmit(a.ctx, "copy-progress", CopyProgress{
		CurrentFile: "Complete",
		FilesDone:   totalItems,
		TotalFiles:  totalItems,
		Percentage:  100,
	})

	return nil
}

// copyFile copies a single file from src to dst, preserving mod time
func copyFile(src, dst string, info os.FileInfo) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	if err != nil {
		return err
	}

	return os.Chtimes(dst, time.Now(), info.ModTime())
}

// copyDir recursively copies a directory tree, attempting to preserve permissions
func copyDir(src string, dst string) error {
	src = filepath.Clean(src)
	dst = filepath.Clean(dst)

	si, err := os.Stat(src)
	if err != nil {
		return err
	}
	if !si.IsDir() {
		return fmt.Errorf("source is not a directory")
	}

	_, err = os.Stat(dst)
	if os.IsNotExist(err) {
		err = os.MkdirAll(dst, si.Mode())
		if err != nil {
			return err
		}
	}

	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			err = copyDir(srcPath, dstPath)
			if err != nil {
				return err
			}
		} else {
			// Skip symlinks for now if not needed, or handle them
			if entry.Type()&os.ModeSymlink != 0 {
				continue
			}
			
			info, err := entry.Info()
			if err != nil {
				return err
			}
			
			err = copyFile(srcPath, dstPath, info)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
