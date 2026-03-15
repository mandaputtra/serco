<script setup lang="ts">
import { computed } from 'vue'
import { getFileName } from '@/utils/path'

const props = defineProps<{
  selectedPaths: Set<string>
}>()

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'close'): void
}>()

const selectionList = computed(() => Array.from(props.selectedPaths))

const close = () => {
  emit('close')
}

const clear = () => {
  emit('clear')
}
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] transform transition-all scale-100"
    >
      <div
        class="p-4 border-b dark:border-gray-700 flex justify-between items-center"
      >
        <h3 class="font-bold text-lg text-gray-800 dark:text-white">
          Selected Files ({{ selectedPaths.size }})
        </h3>
        <button
          @click="close"
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
          @click="clear"
          class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear Selection
        </button>
        <button
          @click="close"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
