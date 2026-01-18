<script setup lang="ts">
import { useFileSystemStore } from '@/stores/fileSystem'
import { computed } from 'vue'

const props = defineProps<{
  paneId: 'left' | 'right'
}>()

const store = useFileSystemStore()

const currentPath = computed(() => {
  if (props.paneId === 'left') {
    return store.leftRoot?.path || ''
  } else {
    return store.rightRoot?.path || ''
  }
})

const parts = computed(() => {
  const path = currentPath.value
  if (!path) return []
  
  // Split path into parts, handling both / and \
  const separator = path.includes('\\') ? '\\' : '/'
  const rawParts = path.split(separator)
  
  // Reconstruct paths for each breadcrumb
  return rawParts.map((part, index) => {
    // If empty string (root on unix), handle carefully
    if (part === '' && index === 0) return { name: '/', path: '/' }
    if (part === '') return null
    
    const slice = rawParts.slice(0, index + 1)
    // On windows, first part 'C:' needs slash if used as path?
    // Actually join with separator
    let fullPath = slice.join(separator)
    if (separator === '/' && !fullPath.startsWith('/')) {
        fullPath = '/' + fullPath
    }
    
    return {
      name: part,
      path: fullPath
    }
  }).filter(Boolean) as { name: string, path: string }[]
})

const navigateTo = (path: string) => {
  store.navigateTo(path, props.paneId)
}
</script>

<template>
  <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap transition-colors duration-200">
    <div 
      v-for="(item, index) in parts" 
      :key="item.path"
      class="flex items-center"
    >
      <span 
        v-if="index > 0" 
        class="mx-1 text-gray-400 dark:text-gray-500"
      >/</span>
      <span 
        @click="navigateTo(item.path)"
        class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'font-semibold text-gray-800 dark:text-gray-100': index === parts.length - 1 }"
      >
        {{ item.name }}
      </span>
    </div>
  </div>
</template>
