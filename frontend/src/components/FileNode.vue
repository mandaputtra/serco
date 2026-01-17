<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileSystemStore, type FileNode } from '@/stores/fileSystem'

const props = defineProps<{
  node: FileNode
  level: number
}>()

const store = useFileSystemStore()
const isOpen = ref(false)

const hasMatchingChild = (node: FileNode, query: string): boolean => {
  if (!node.children) return false
  return node.children.some(child => 
    child.name.toLowerCase().includes(query) || hasMatchingChild(child, query)
  )
}

// Check if this node or any children match the search query
const matchesSearch = computed(() => {
  if (!store.searchQuery) return true
  const query = store.searchQuery.toLowerCase()
  // Match self
  if (props.node.name.toLowerCase().includes(query)) return true
  // Match children
  return hasMatchingChild(props.node, query)
})

// Auto-expand if search query is active and children match
watch(() => store.searchQuery, (newVal) => {
  if (newVal && hasMatchingChild(props.node, newVal.toLowerCase())) {
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

const toggleSelection = () => {
  store.toggleSelection(props.node.path)
}

const isSelected = computed(() => store.isSelected(props.node.path))

// Format size
const formatSize = (bytes: number) => {
  if (props.node.isDir) return '-'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <div v-if="matchesSearch" class="file-node select-none">
    <div 
      class="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-50"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
      @click="toggleOpen"
    >
      <!-- Checkbox -->
      <input 
        type="checkbox" 
        :checked="isSelected" 
        @click.stop="toggleSelection"
        class="mr-3 h-4 w-4 rounded border-gray-300"
      />

      <!-- Expand/Collapse Icon -->
      <span v-if="node.isDir" class="mr-2 w-4 text-center text-gray-500 font-mono">
        <template v-if="node.isLoading">
          <!-- Small spinner for loading children -->
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
      <div class="hidden md:flex gap-4 text-gray-500 text-xs whitespace-nowrap items-center">
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
      />
    </div>
  </div>
</template>
