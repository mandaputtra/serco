<script setup lang="ts">
import { useFileSystemStore } from '@/stores/fileSystem'
import FileNode from './FileNode.vue'
import { computed } from 'vue'

const props = defineProps<{
  paneId: 'left' | 'right'
  allowMultiSelect: boolean
  foldersOnly: boolean
}>()

const store = useFileSystemStore()

const rootNode = computed(() => {
  return props.paneId === 'left' ? store.leftRoot : store.rightRoot
})

const isActive = computed(() => store.activePane === props.paneId)

const handlePaneClick = () => {
  store.setActivePane(props.paneId)
}
</script>

<template>
  <div 
    class="file-tree w-full h-full flex flex-col bg-white border transition-colors duration-200"
    :class="[
      isActive ? 'border-2 border-blue-500 bg-blue-50/10' : 'border border-gray-200'
    ]"
    @click.capture="handlePaneClick"
  >
    <!-- Pane Header -->
    <div class="flex items-center p-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
      <div class="w-8 text-center">{{ paneId === 'left' ? 'L' : 'R' }}</div>
      <div class="flex-grow pl-2">{{ paneId === 'left' ? 'File Browser' : 'Destination' }}</div>
      <div v-if="!foldersOnly" class="hidden md:block w-20 text-right mr-4">Size</div>
      <div v-if="!foldersOnly" class="hidden md:block w-40 text-right">Modified</div>
    </div>
    
    <!-- Loading State -->
    <div v-if="store.isLoading && !rootNode" class="flex-grow flex items-center justify-center p-8 text-gray-500">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    </div>

    <!-- Tree Content -->
    <div v-else-if="rootNode" class="overflow-auto flex-grow relative">
      <FileNode 
        :node="rootNode" 
        :level="0" 
        :paneId="paneId"
        :allowMultiSelect="allowMultiSelect"
        :foldersOnly="foldersOnly"
      />
    </div>

    <!-- Error/Empty State -->
    <div v-else class="p-8 text-center text-red-500">
      Not loaded.
    </div>
  </div>
</template>
