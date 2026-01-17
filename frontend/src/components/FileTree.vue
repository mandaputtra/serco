<script setup lang="ts">
import { onMounted } from 'vue'
import { useFileSystemStore } from '@/stores/fileSystem'
import FileNode from './FileNode.vue'

const store = useFileSystemStore()

onMounted(() => {
    store.loadFileSystem()
})
</script>

<template>
  <div class="file-tree w-full h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
    <div v-if="store.isLoading" class="flex-grow flex items-center justify-center p-8 text-gray-500">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Scanning directory...</span>
      </div>
    </div>
    <div v-else-if="store.rootNode" class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center p-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div class="w-8"></div> <!-- Spacing -->
        <div class="flex-grow pl-10">Name</div>
        <div class="hidden md:block w-20 text-right mr-4">Size</div>
        <div class="hidden md:block w-40 text-right">Modified</div>
      </div>
      
      <!-- Scrollable Tree Area -->
      <div class="overflow-auto flex-grow">
        <FileNode :node="store.rootNode" :level="0" />
      </div>
    </div>
    <div v-else class="p-8 text-center text-red-500">
      Failed to load file system.
    </div>
  </div>
</template>
