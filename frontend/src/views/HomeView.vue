<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useFileSystemStore } from '@/stores/fileSystem'
import FileTree from '@/components/FileTree.vue'
import SplitPane from '@/components/SplitPane.vue'
import ToolBar from '@/components/ToolBar.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const store = useFileSystemStore()

const showSelectionModal = ref(false)
const showHelpModal = ref(false)

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

// Handle Paste for multi-line search inputs
const handlePaste = (e: ClipboardEvent) => {
  const pastedText = e.clipboardData?.getData('text')
  if (!pastedText) return

  // Check if pasted text has newlines
  if (pastedText.includes('\n')) {
    e.preventDefault() // Stop default paste

    // Process the text
    const processed = pastedText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0) // Remove empty lines

    // Remove duplicates
    const uniqueItems = [...new Set(processed)]

    if (uniqueItems.length > 0) {
      // Join with commas for our multi-search logic
      const newQuery = uniqueItems.join(',')
      store.searchQuery = newQuery

      store.showToastNotification(
        `Converted ${uniqueItems.length} lines to search query`
      )
    }
  }
}
</script>

<template>
  <div
    class="home h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative transition-colors duration-200"
  >
    <!-- Header Area -->
    <div
      class="flex-none p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm space-y-3 z-20"
    >
      <!-- Search Bar Row -->
      <div class="flex items-center space-x-2">
        <!-- Search Bar (Flexible Width) -->
        <div class="relative flex-grow h-12">
          <input
            v-model="store.searchQuery"
            @paste="handlePaste"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full h-full pl-11 pr-4 py-2 text-base rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
            :class="{
              'ring-2 ring-blue-100 dark:ring-blue-900 border-blue-400 dark:border-blue-500':
                store.activePane === 'left',
              'ring-2 ring-green-100 dark:ring-green-900 border-green-400 dark:border-green-500':
                store.activePane === 'right',
            }"
            :disabled="store.isCopying"
          />
          <span
            class="absolute left-3.5 top-3.5 text-gray-400 dark:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>

        <!-- Help Button -->
        <button
          @click="showHelpModal = true"
          class="h-12 w-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          title="Search Help"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      <!-- Dark Mode Toggle & Toolbar Row -->
      <div class="flex items-center justify-between pt-[10px]">
        <!-- Toolbar -->
        <ToolBar @show-selection="showSelectionModal = true" />

        <!-- Dark Mode Toggle -->
        <button
          @click="store.toggleDarkMode()"
          class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          :title="
            store.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
          "
        >
          <!-- Sun Icon (for Dark Mode) -->
          <svg
            v-if="store.isDarkMode"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <!-- Moon Icon (for Light Mode) -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content (Split Pane) -->
    <div
      class="flex-grow overflow-hidden relative p-4"
      :class="{ 'pointer-events-none blur-[1px] opacity-75': store.isCopying }"
    >
      <SplitPane
        :initial-left-width="60"
        :min-left-width="20"
        :min-right-width="20"
      >
        <template #left>
          <div class="h-full pr-1 md:pr-0 flex flex-col">
            <!-- Navigation Controls Left -->
            <div class="flex items-center space-x-2 mb-2">
              <button
                @click="store.goBack('left')"
                class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="store.leftHistoryIndex <= 0"
                title="Back"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                @click="store.goForward('left')"
                class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="
                  store.leftHistoryIndex >= store.leftHistory.length - 1
                "
                title="Forward"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div class="flex-grow overflow-hidden">
                <Breadcrumbs paneId="left" />
              </div>
            </div>

            <div
              class="flex-grow overflow-hidden border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            >
              <FileTree
                paneId="left"
                :allowMultiSelect="true"
                :foldersOnly="false"
              />
            </div>
          </div>
        </template>
        <template #right>
          <div class="h-full pl-1 md:pl-0 flex flex-col">
            <!-- Navigation Controls Right -->
            <div class="flex items-center space-x-2 mb-2">
              <button
                @click="store.goBack('right')"
                class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="store.rightHistoryIndex <= 0"
                title="Back"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                @click="store.goForward('right')"
                class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="
                  store.rightHistoryIndex >= store.rightHistory.length - 1
                "
                title="Forward"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div class="flex-grow overflow-hidden">
                <Breadcrumbs paneId="right" />
              </div>
            </div>

            <div
              class="flex-grow overflow-hidden border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            >
              <FileTree
                paneId="right"
                :allowMultiSelect="false"
                :foldersOnly="true"
              />
            </div>
          </div>
        </template>
      </SplitPane>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="store.showToast"
      class="fixed bottom-8 right-8 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium transition-opacity duration-300"
    >
      {{ store.clipboardMessage }}
    </div>

    <!-- Selection Modal -->
    <div
      v-if="showSelectionModal"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      @click.self="showSelectionModal = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] transform transition-all scale-100"
      >
        <div
          class="p-4 border-b dark:border-gray-700 flex justify-between items-center"
        >
          <h3 class="font-bold text-lg text-gray-800 dark:text-white">
            Selected Files ({{ store.selectedLeft.size }})
          </h3>
          <button
            @click="showSelectionModal = false"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div class="flex-grow overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          <ul class="space-y-1">
            <li
              v-for="path in selectionList"
              :key="path"
              class="text-sm font-mono text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 relative group cursor-default"
            >
              <!-- Display Filename -->
              <span class="block group-hover:hidden truncate">{{
                getFileName(path)
              }}</span>
              <!-- Display Full Path on Hover (Inline Replacement) -->
              <span
                class="hidden group-hover:block text-xs bg-gray-100 dark:bg-gray-600 p-1 rounded break-all"
                >{{ path }}</span
              >
            </li>
          </ul>
          <div
            v-if="selectionList.length === 0"
            class="text-gray-500 dark:text-gray-400 text-center italic py-4"
          >
            No files selected.
          </div>
        </div>

        <div
          class="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-2"
        >
          <button
            @click="clearSelection"
            class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
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

    <!-- Help Modal -->
    <div
      v-if="showHelpModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="showHelpModal = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up"
      >
        <h3
          class="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white"
        >
          <svg
            class="w-6 h-6 mr-2 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Search Help
        </h3>
        <div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            The <strong>Left Pane</strong> supports Regular Expressions (Regex)
            and <strong>Multi-File Search</strong>.
          </p>

          <div
            class="bg-gray-50 dark:bg-gray-700 p-3 rounded border dark:border-gray-600"
          >
            <h4 class="font-semibold mb-2">Regex Examples:</h4>
            <ul class="list-disc pl-5 space-y-1 mb-4">
              <li><code>\.jpg$</code> - Find all JPG images</li>
              <li><code>^report</code> - Files starting with "report"</li>
              <li>
                <code>\d{4}</code> - Files containing 4 digits (e.g., years)
              </li>
            </ul>

            <h4 class="font-semibold mb-2">Multi-File Search:</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                Separate multiple queries with commas:
                <code>img_01.jpg, img_02.png</code>
              </li>
              <li>
                <strong>Paste Support</strong>: Paste a list of filenames (one
                per line) to automatically convert them into a comma-separated
                search.
              </li>
            </ul>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            Note: The <strong>Right Pane</strong> search uses exact matching for
            folder names.
          </p>
        </div>
        <div class="mt-6 text-right">
          <button
            @click="showHelpModal = false"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Got it
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
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-fade-in-up"
      >
        <div
          class="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
        >
          <h3
            class="font-bold text-lg text-gray-800 dark:text-white flex items-center"
          >
            <svg
              class="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Confirm Copy
          </h3>
        </div>

        <div class="p-5 space-y-4 text-gray-800 dark:text-gray-200">
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
              >Destination</label
            >
            <div
              class="text-sm font-mono bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200 break-all"
            >
              {{ store.selectedRight }}
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
            >
              Files to Copy ({{ store.selectedLeft.size }})
            </label>
            <div
              class="max-h-40 overflow-auto border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 p-2"
            >
              <ul class="space-y-1">
                <li
                  v-for="path in selectionList"
                  :key="path"
                  class="text-xs font-mono text-gray-600 dark:text-gray-400 break-all truncate"
                >
                  {{ getFileName(path) }}
                </li>
              </ul>
            </div>
          </div>

          <div class="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to proceed with this operation?
          </div>
        </div>

        <div
          class="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3"
        >
          <button
            @click="store.cancelCopy"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        <div class="mb-6 relative inline-block">
          <svg
            class="animate-spin h-12 w-12 text-blue-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Processing...
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
          {{ progressMessage }}
        </p>

        <!-- Progress Bar -->
        <div
          class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden"
        >
          <div
            class="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <div
          class="text-right text-xs text-gray-500 dark:text-gray-400 font-mono"
        >
          {{ progressPercent }}%
        </div>
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
