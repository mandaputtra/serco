import { defineStore } from 'pinia'
// @ts-ignore
import { GetHomeDir, ScanDirectory, CopyFiles } from '../../wailsjs/go/main/App'
// @ts-ignore
import { ClipboardSetText, EventsOn, EventsOff } from '../../wailsjs/runtime'

export interface FileNode {
  name: string
  path: string
  isDir: boolean
  size: number
  modTime: string
  children?: FileNode[]
  isLoading?: boolean
}

export interface CopyProgress {
  currentFile: string
  filesDone: number
  totalFiles: number
  percentage: number
}

export const useFileSystemStore = defineStore('fileSystem', {
  state: () => ({
    // Dual pane roots
    leftRoot: null as FileNode | null,
    rightRoot: null as FileNode | null,

    // Navigation History
    leftHistory: [] as string[],
    leftHistoryIndex: -1,
    rightHistory: [] as string[],
    rightHistoryIndex: -1,

    // State
    isLoading: false,
    activePane: 'left' as 'left' | 'right',
    showHiddenFiles: false,

    // Selections
    selectedLeft: new Set<string>(), // Multi-select
    selectedRight: null as string | null, // Single-select (destination)

    // Search
    searchQuery: '',

    // Clipboard Status
    clipboardMessage: '',
    showToast: false,
    
    // Copy Operation State
    showCopyConfirm: false,
    isCopying: false,
    copyProgress: null as CopyProgress | null
  }),

  actions: {
    async init() {
      this.isLoading = true
      try {
        const homeDir = await GetHomeDir()
        // Initialize Left Pane
        this.leftRoot = await ScanDirectory(homeDir)
        this.leftHistory = [homeDir]
        this.leftHistoryIndex = 0

        // Initialize Right Pane
        this.rightRoot = await ScanDirectory(homeDir)
        this.rightHistory = [homeDir]
        this.rightHistoryIndex = 0
      } catch (error) {
        console.error('Failed to init file system:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadChildren(node: FileNode) {
      if (!node.isDir || (node.children && node.children.length > 0)) return

      node.isLoading = true
      try {
        const result = await ScanDirectory(node.path)
        if (result && result.children) {
          node.children = result.children
        } else {
          node.children = []
        }
      } catch (error) {
        console.error(`Failed to load children for ${node.path}:`, error)
      } finally {
        node.isLoading = false
      }
    },

    // Navigation Logic
    async navigateTo(path: string, paneId: 'left' | 'right', addToHistory = true) {
      this.isLoading = true
      try {
        const result = await ScanDirectory(path)
        if (paneId === 'left') {
          this.leftRoot = result
          if (addToHistory) {
            // If we are not at the end of history, truncate forward history
            if (this.leftHistoryIndex < this.leftHistory.length - 1) {
              this.leftHistory = this.leftHistory.slice(0, this.leftHistoryIndex + 1)
            }
            this.leftHistory.push(path)
            this.leftHistoryIndex++
          }
        } else {
          this.rightRoot = result
          if (addToHistory) {
             if (this.rightHistoryIndex < this.rightHistory.length - 1) {
              this.rightHistory = this.rightHistory.slice(0, this.rightHistoryIndex + 1)
            }
            this.rightHistory.push(path)
            this.rightHistoryIndex++
          }
        }
      } catch (error) {
        console.error(`Failed to navigate to ${path}:`, error)
      } finally {
        this.isLoading = false
      }
    },

    async goBack(paneId: 'left' | 'right') {
      if (paneId === 'left') {
        if (this.leftHistoryIndex > 0) {
          this.leftHistoryIndex--
          await this.navigateTo(this.leftHistory[this.leftHistoryIndex], 'left', false)
        }
      } else {
         if (this.rightHistoryIndex > 0) {
          this.rightHistoryIndex--
          await this.navigateTo(this.rightHistory[this.rightHistoryIndex], 'right', false)
        }
      }
    },

    async goForward(paneId: 'left' | 'right') {
      if (paneId === 'left') {
        if (this.leftHistoryIndex < this.leftHistory.length - 1) {
          this.leftHistoryIndex++
          await this.navigateTo(this.leftHistory[this.leftHistoryIndex], 'left', false)
        }
      } else {
        if (this.rightHistoryIndex < this.rightHistory.length - 1) {
          this.rightHistoryIndex++
          await this.navigateTo(this.rightHistory[this.rightHistoryIndex], 'right', false)
        }
      }
    },

    setActivePane(pane: 'left' | 'right') {
      this.activePane = pane
    },

    toggleHiddenFiles() {
      this.showHiddenFiles = !this.showHiddenFiles
      // Trigger a refresh or UI update if needed, though reactivity handles v-if
    },

    // Selection Logic
    async toggleLeftSelection(node: FileNode) {
      const isSelected = !this.selectedLeft.has(node.path)
      this.toggleRecursive(node, isSelected)
    },

    async toggleRecursive(node: FileNode, isSelected: boolean) {
      // Toggle current node
      if (isSelected) {
        this.selectedLeft.add(node.path)
      } else {
        this.selectedLeft.delete(node.path)
      }

      // Handle children if directory
      if (node.isDir) {
        // If children are not loaded, try to load them first (optional, but good for UX)
        // However, auto-loading everything recursively can be slow. 
        // For now, we only recurse if children are already present to avoid accidental massive scans.
        // Or we could force load. Let's stick to loaded children to be safe, or just what's in memory.
        
        if (node.children) {
          node.children.forEach(child => this.toggleRecursive(child, isSelected))
        }
      }
    },

    setRightSelection(path: string) {
      this.selectedRight = path
    },

    clearSelection() {
      this.selectedLeft.clear()
    },

    // Clipboard
    async copyToClipboard() {
      if (this.selectedLeft.size === 0) return

      const paths = Array.from(this.selectedLeft).join('\n')
      try {
        await ClipboardSetText(paths)
        this.showToastNotification(`Copied ${this.selectedLeft.size} paths to clipboard`)
      } catch (e) {
        console.error(e)
      }
    },

    // File Operations
    initiateCopy() {
      if (this.selectedLeft.size === 0) {
        this.showToastNotification("No files selected")
        return
      }
      if (!this.selectedRight) {
        this.showToastNotification("No destination selected")
        return
      }
      this.showCopyConfirm = true
    },

    async confirmCopy() {
      this.showCopyConfirm = false
      this.isCopying = true
      this.copyProgress = {
        currentFile: 'Starting...',
        filesDone: 0,
        totalFiles: this.selectedLeft.size,
        percentage: 0
      }

      // Listen for progress
      EventsOn("copy-progress", (progress: CopyProgress) => {
        this.copyProgress = progress
      })

      try {
        const srcPaths = Array.from(this.selectedLeft)
        await CopyFiles(srcPaths, this.selectedRight)
        this.showToastNotification("Files copied successfully")
        this.clearSelection() // Clear selection after successful copy
      } catch (e: any) {
        this.showToastNotification(`Copy failed: ${e.message || e}`)
      } finally {
        // Clean up
        EventsOff("copy-progress")
        this.isCopying = false
        this.copyProgress = null
      }
    },

    cancelCopy() {
      this.showCopyConfirm = false
    },

    showToastNotification(msg: string) {
      this.clipboardMessage = msg
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    }
  }
})
