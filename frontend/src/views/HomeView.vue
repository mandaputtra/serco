<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useFileSystemStore } from '@/stores/fileSystem'
import FileTree from '@/components/FileTree.vue'
import SplitPane from '@/components/SplitPane.vue'
import ToolBar from '@/components/ToolBar.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import HelpModal from '@/components/modals/HelpModal.vue'
import SelectionModal from '@/components/modals/SelectionModal.vue'
import CopyConfirmModal from '@/components/modals/CopyConfirmModal.vue'
import ProgressOverlay from '@/components/modals/ProgressOverlay.vue'

const store = useFileSystemStore()

const showSelectionModal = ref(false)
const showHelpModal = ref(false)

// Keyboard shortcuts handler
const handleKeyDown = (e: KeyboardEvent) => {
  // Don't trigger shortcuts when copying or when typing in input fields
  if (store.isCopying) return
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    // Allow Escape even in inputs
    if (e.key !== 'Escape') return
  }

  // Escape: Close modals or clear selection
  if (e.key === 'Escape') {
    if (showHelpModal.value) {
      showHelpModal.value = false
    } else if (showSelectionModal.value) {
      showSelectionModal.value = false
    } else if (store.showCopyConfirm) {
      store.cancelCopy()
    } else if (store.selectedLeft.size > 0) {
      store.clearSelection()
    }
    return
  }

  // Ctrl/Cmd + A: Select all visible files in left pane
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    e.preventDefault()
    if (store.activePane === 'left' && store.leftRoot?.children) {
      store.leftRoot.children.forEach(child => {
        if (!child.isDir) {
          store.selectedLeft.add(child.path)
        }
      })
    }
    return
  }

  // F5: Refresh current directory
  if (e.key === 'F5') {
    e.preventDefault()
    const currentRoot = store.activePane === 'left' ? store.leftRoot : store.rightRoot
    if (currentRoot) {
      store.navigateTo(currentRoot.path, store.activePane, false)
    }
    return
  }

  // Delete: Clear selection
  if (e.key === 'Delete') {
    store.clearSelection()
    return
  }

  // Ctrl/Cmd + C: Copy paths (when not in input)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (store.selectedLeft.size > 0) {
      store.copyToClipboard()
    }
    return
  }

  // Ctrl/Cmd + ?: Show help
  if ((e.ctrlKey || e.metaKey) && e.key === '?') {
    e.preventDefault()
    showHelpModal.value = true
    return
  }
}

onMounted(() => {
  store.init()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Search Placeholder logic based on active pane
const searchPlaceholder = computed(() => {
  if (store.activePane === 'left') {
    return 'Search files (Regex supported)...'
  } else {
    return 'Search destination folders (Exact match)...'
  }
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

const handleClearSelection = () => {
  store.clearSelection()
  showSelectionModal.value = false
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
    <ToastNotification :show="store.showToast" :message="store.clipboardMessage" />

    <!-- Selection Modal -->
    <SelectionModal
      v-if="showSelectionModal"
      :selected-paths="store.selectedLeft"
      @clear="handleClearSelection"
      @close="showSelectionModal = false"
    />

    <!-- Help Modal -->
    <HelpModal v-if="showHelpModal" @close="showHelpModal = false" />

    <!-- Copy Confirmation Modal -->
    <CopyConfirmModal
      v-if="store.showCopyConfirm"
      :selected-paths="store.selectedLeft"
      :destination-path="store.selectedRight"
      @confirm="store.confirmCopy"
      @cancel="store.cancelCopy"
    />

    <!-- Progress Overlay -->
    <ProgressOverlay :progress="store.copyProgress" />
  </div>
</template>
