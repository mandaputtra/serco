import { defineStore } from 'pinia'
// @ts-ignore
import { GetHomeDir, ScanDirectory } from '../../wailsjs/go/main/App'

export interface FileNode {
  name: string
  path: string
  isDir: boolean
  size: number
  modTime: string
  children?: FileNode[]
  isLoading?: boolean // Added for lazy loading state
}

export const useFileSystemStore = defineStore('fileSystem', {
  state: () => ({
    rootNode: null as FileNode | null,
    isLoading: false,
    selectedPaths: new Set<string>(),
    searchQuery: '',
  }),
  actions: {
    async loadFileSystem() {
      this.isLoading = true
      console.log('Starting file system load...')
      try {
        const homeDir = await GetHomeDir()
        console.log('Home directory:', homeDir)
        // Scan only top level
        this.rootNode = await ScanDirectory(homeDir)
        console.log('Root node loaded:', this.rootNode)
      } catch (error) {
        console.error('Failed to load file system:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadChildren(node: FileNode) {
      if (!node.isDir || (node.children && node.children.length > 0)) return

      // If we already have empty children array (from Go), it means we haven't fetched real children yet
      // BUT, Go might return empty array if dir is empty. 
      // To distinguish, we rely on the fact that if we haven't loaded, we call ScanDirectory again.
      // Optimization: We could add a 'loaded' flag, but for now re-scanning on expand is safer.

      node.isLoading = true
      try {
        console.log('Loading children for:', node.path)
        const result = await ScanDirectory(node.path)
        if (result && result.children) {
          node.children = result.children
        } else {
          // If no children, ensure it's an empty array so we don't try to load again unnecessarily
          // (unless we want to support refresh)
          node.children = []
        }
      } catch (error) {
        console.error(`Failed to load children for ${node.path}:`, error)
      } finally {
        node.isLoading = false
      }
    },

    toggleSelection(path: string) {
      if (this.selectedPaths.has(path)) {
        this.selectedPaths.delete(path)
      } else {
        this.selectedPaths.add(path)
      }
    },
    isSelected(path: string) {
      return this.selectedPaths.has(path)
    }
  }
})
