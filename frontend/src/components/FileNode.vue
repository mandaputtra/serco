<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileSystemStore, type FileNode } from '@/stores/fileSystem'

const props = defineProps<{
  node: FileNode
  level: number
  paneId: 'left' | 'right'
  allowMultiSelect: boolean
  foldersOnly: boolean
}>()

const store = useFileSystemStore()
const isOpen = ref(false)

const isHidden = computed(() => props.node.name.startsWith('.'))

// Visibility Logic
const isVisible = computed(() => {
  // Hide if foldersOnly is true and this is a file
  if (props.foldersOnly && !props.node.isDir) return false
  
  // Hide hidden files if not enabled
  if (isHidden.value && !store.showHiddenFiles) return false
  
  return true
})

// Search Logic
const hasMatchingChild = (node: FileNode, query: string, isRegex: boolean): boolean => {
  if (!node.children) return false
  return node.children.some(child => {
    // Apply visibility filter to search recursion too
    if (props.foldersOnly && !child.isDir) return false
    if (child.name.startsWith('.') && !store.showHiddenFiles) return false
    
    return checkMatch(child.name, query, isRegex) || hasMatchingChild(child, query, isRegex)
  })
}

const checkMatch = (name: string, query: string, isRegex: boolean) => {
  if (!query) return true
  if (isRegex) {
    try {
      return new RegExp(query, 'i').test(name)
    } catch {
      return name.toLowerCase().includes(query.toLowerCase())
    }
  } else {
    // Exact match case sensitive for folders (right pane) per requirements?
    // "Right pane active: Search filters folders (exact match, case-sensitive)"
    // That's quite strict, maybe startsWith is better? Implementing exact match as requested.
    return name === query
  }
}

const matchesSearch = computed(() => {
  if (!store.searchQuery) return true
  // Only apply search if this pane is active
  if (store.activePane !== props.paneId) return true

  const isLeft = props.paneId === 'left'
  // Left: Regex, Case-insensitive. Right: Exact, Case-sensitive
  const isRegex = isLeft
  
  // Match self
  if (checkMatch(props.node.name, store.searchQuery, isRegex)) return true
  
  // Match children
  return hasMatchingChild(props.node, store.searchQuery, isRegex)
})

// Auto-expand
watch(() => store.searchQuery, (newVal) => {
  if (store.activePane !== props.paneId) return
  
  const isRegex = props.paneId === 'left'
  if (newVal && hasMatchingChild(props.node, newVal, isRegex)) {
    isOpen.value = true
  } else if (!newVal) {
    isOpen.value = false
  }
})

const toggleOpen = async () => {
  if (props.node.isDir) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      await store.loadChildren(props.node)
    }
  }
}

const handleSelect = () => {
  if (props.paneId === 'left') {
    store.toggleLeftSelection(props.node.path)
  } else {
    // Right pane single select (only folders allowed as dest)
    if (props.node.isDir) {
      store.setRightSelection(props.node.path)
    }
  }
}

const isSelected = computed(() => {
  if (props.paneId === 'left') {
    return store.selectedLeft.has(props.node.path)
  } else {
    return store.selectedRight === props.node.path
  }
})

// Formatters
const formatSize = (bytes: number) => {
  if (props.node.isDir) return '-'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <div v-if="isVisible && matchesSearch" class="file-node select-none">
    <div 
      class="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-50 transition-colors duration-150"
      :class="{ 'opacity-60 italic': isHidden, 'bg-blue-50': isSelected }"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click="toggleOpen"
    >
      <!-- Checkbox / Radio -->
      <div 
        @click.stop="handleSelect"
        class="mr-3 flex items-center justify-center cursor-pointer"
      >
        <input 
          v-if="paneId === 'left'"
          type="checkbox" 
          :checked="isSelected" 
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <input 
          v-else-if="node.isDir"
          type="radio"
          :checked="isSelected"
          class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span v-else class="w-4"></span>
      </div>

      <!-- Expand/Collapse Icon -->
      <span v-if="node.isDir" class="mr-2 w-4 text-center text-gray-500 font-mono">
        <template v-if="node.isLoading">
           <svg class="animate-spin h-3 w-3 text-gray-500 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </template>
        <template v-else>
          {{ isOpen ? '▼' : '▶' }}
        </template>
      </span>
      <span v-else class="mr-2 w-4"></span>

      <!-- Type Icon -->
      <span class="mr-2 text-lg">{{ node.isDir ? '📁' : '📄' }}</span>

      <!-- Name -->
      <span class="flex-grow truncate mr-4 font-medium text-gray-700">{{ node.name }}</span>

      <!-- Metadata (Desktop only) -->
      <div v-if="!foldersOnly" class="hidden md:flex gap-4 text-gray-500 text-xs whitespace-nowrap items-center">
        <span class="w-20 text-right">{{ formatSize(node.size) }}</span>
        <span class="w-40 text-right">{{ formatDate(node.modTime) }}</span>
      </div>
    </div>

    <!-- Children -->
    <div v-if="node.isDir && isOpen">
      <FileNode 
        v-for="child in node.children" 
        :key="child.path" 
        :node="child" 
        :level="level + 1"
        :paneId="paneId"
        :allowMultiSelect="allowMultiSelect"
        :foldersOnly="foldersOnly"
      />
    </div>
  </div>
</template>
