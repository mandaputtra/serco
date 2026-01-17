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
        this.leftRoot = await ScanDirectory(homeDir)
        // Initialize right pane to same dir initially or null
        this.rightRoot = await ScanDirectory(homeDir)
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

    setActivePane(pane: 'left' | 'right') {
      this.activePane = pane
    },

    toggleHiddenFiles() {
      this.showHiddenFiles = !this.showHiddenFiles
      // Trigger a refresh or UI update if needed, though reactivity handles v-if
    },

    // Selection Logic
    toggleLeftSelection(path: string) {
      if (this.selectedLeft.has(path)) {
        this.selectedLeft.delete(path)
      } else {
        this.selectedLeft.add(path)
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

        // Clear selection after successful copy? Optional.
        // this.clearSelection()
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
