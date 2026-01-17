<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useFileSystemStore } from '@/stores/fileSystem'
import FileTree from '@/components/FileTree.vue'
import SplitPane from '@/components/SplitPane.vue'
import Toolbar from '@/components/Toolbar.vue'

const store = useFileSystemStore()

const showSelectionModal = ref(false)

onMounted(() => {
  store.init()
})

const selectionList = computed(() => Array.from(store.selectedLeft))

const getFileName = (path: string) => {
  // Handle both Windows (\) and Unix (/) paths
  const separator = path.includes('\\') ? '\\' : '/'
  return path.split(separator).pop() || path
}

const clearSelection = () => {
  store.clearSelection()
  showSelectionModal.value = false
}

// Search Placeholder logic based on active pane
const searchPlaceholder = computed(() => {
  if (store.activePane === 'left') {
    return 'Search files (Regex supported)...'
  } else {
    return 'Search destination folders (Exact match)...'
  }
})

// Progress helpers
const progressPercent = computed(() => {
  if (!store.copyProgress) return 0
  return store.copyProgress.percentage.toFixed(1)
})

const progressMessage = computed(() => {
  if (!store.copyProgress) return ''
  if (store.copyProgress.percentage === 100) return 'Complete'
  return `Copying ${store.copyProgress.currentFile} (${store.copyProgress.filesDone}/${store.copyProgress.totalFiles})`
})
</script>

<template>
  <div class="home h-full flex flex-col bg-gray-50 relative">
    <!-- Header Area -->
    <div class="flex-none p-4 bg-white border-b shadow-sm space-y-3 z-20">
      
      <!-- Search Bar (Full Width) - Enhanced size (h-12) -->
      <div class="relative w-full h-12">
        <input 
          v-model="store.searchQuery"
          type="text" 
          :placeholder="searchPlaceholder"
          class="w-full h-full pl-11 pr-4 py-2 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
          :class="{ 'ring-2 ring-blue-100 border-blue-400': store.activePane === 'left', 'ring-2 ring-green-100 border-green-400': store.activePane === 'right' }"
          :disabled="store.isCopying"
        />
        <span class="absolute left-3.5 top-3.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      <!-- Toolbar (10px spacing below search) -->
      <div class="pt-[10px]">
        <Toolbar @show-selection="showSelectionModal = true" />
      </div>
    </div>

    <!-- Main Content (Split Pane) -->
    <div class="flex-grow overflow-hidden relative p-4" :class="{ 'pointer-events-none blur-[1px] opacity-75': store.isCopying }">
      <SplitPane 
        :initial-left-width="60" 
        :min-left-width="20" 
        :min-right-width="20"
      >
        <template #left>
          <div class="h-full pr-1 md:pr-0">
            <FileTree 
              paneId="left" 
              :allowMultiSelect="true" 
              :foldersOnly="false" 
            />
          </div>
        </template>
        <template #right>
          <div class="h-full pl-1 md:pl-0">
            <FileTree 
              paneId="right" 
              :allowMultiSelect="false" 
              :foldersOnly="true" 
            />
          </div>
        </template>
      </SplitPane>
    </div>

    <!-- Toast Notification -->
    <div 
      v-if="store.showToast"
      class="fixed bottom-8 right-8 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium transition-opacity duration-300"
    >
      {{ store.clipboardMessage }}
    </div>

    <!-- Selection Modal -->
    <div 
      v-if="showSelectionModal"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      @click.self="showSelectionModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] transform transition-all scale-100">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-bold text-lg text-gray-800">Selected Files ({{ store.selectedLeft.size }})</h3>
          <button @click="showSelectionModal = false" class="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
        </div>
        
        <div class="flex-grow overflow-auto p-4 bg-gray-50">
          <ul class="space-y-1">
            <li 
              v-for="path in selectionList" 
              :key="path" 
              class="text-sm font-mono text-gray-700 p-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 relative group"
              :title="path"
            >
              {{ getFileName(path) }}
              <div class="hidden group-hover:block absolute left-0 bottom-full mb-1 w-full z-10">
                <div class="bg-gray-800 text-white text-xs rounded p-2 break-all shadow-lg mx-2">
                  {{ path }}
                </div>
              </div>
            </li>
          </ul>
          <div v-if="selectionList.length === 0" class="text-gray-500 text-center italic py-4">
            No files selected.
          </div>
        </div>

        <div class="p-4 border-t bg-gray-50 flex justify-end space-x-2">
          <button 
            @click="clearSelection" 
            class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Selection
          </button>
          <button 
            @click="showSelectionModal = false" 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Copy Confirmation Modal -->
    <div 
      v-if="store.showCopyConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      @click.self="store.cancelCopy"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-fade-in-up">
        <div class="p-5 border-b bg-gray-50">
          <h3 class="font-bold text-lg text-gray-800 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Confirm Copy
          </h3>
        </div>
        
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Destination</label>
            <div class="text-sm font-mono bg-blue-50 p-2 rounded border border-blue-100 text-blue-800 break-all">
              {{ store.selectedRight }}
            </div>
          </div>
          
          <div>
             <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
               Files to Copy ({{ store.selectedLeft.size }})
             </label>
             <div class="max-h-40 overflow-auto border rounded bg-gray-50 p-2">
               <ul class="space-y-1">
                 <li v-for="path in selectionList" :key="path" class="text-xs font-mono text-gray-600 break-all truncate">
                   {{ getFileName(path) }}
                 </li>
               </ul>
             </div>
          </div>
          
          <div class="text-sm text-gray-600">
            Are you sure you want to proceed with this operation?
          </div>
        </div>

        <div class="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button 
            @click="store.cancelCopy" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button 
            @click="store.confirmCopy" 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirm Copy
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Locking Overlay -->
    <div 
      v-if="store.isCopying"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm cursor-wait"
    >
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
        <div class="mb-6 relative inline-block">
          <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <h3 class="text-xl font-bold text-gray-800 mb-2">Processing...</h3>
        <p class="text-gray-500 text-sm mb-6">{{ progressMessage }}</p>
        
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
          <div 
            class="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <div class="text-right text-xs text-gray-500 font-mono">{{ progressPercent }}%</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
