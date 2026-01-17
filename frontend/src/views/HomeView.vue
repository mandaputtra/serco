<script setup lang="ts">
import { useFileSystemStore } from '@/stores/fileSystem'
import FileTree from '@/components/FileTree.vue'

const store = useFileSystemStore()
</script>

<template>
  <div class="home h-full flex flex-col p-4">
    <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
      <h1 class="text-2xl font-bold text-gray-800">File System Viewer</h1>
      <div class="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
        {{ store.selectedPaths.size }} items selected
      </div>
    </div>
    
    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative max-w-2xl">
        <input 
          v-model="store.searchQuery"
          type="text" 
          placeholder="Search files and directories..." 
          class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
        />
        <span class="absolute left-3 top-3.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Tree View -->
    <div class="flex-grow overflow-hidden relative">
      <FileTree />
    </div>
  </div>
</template>
