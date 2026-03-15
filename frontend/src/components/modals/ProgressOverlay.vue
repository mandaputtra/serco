<script setup lang="ts">
import { computed } from 'vue'
import type { CopyProgress } from '@/stores/fileSystem'

const props = defineProps<{
  progress: CopyProgress | null
}>()

const isVisible = computed(() => props.progress !== null)

const progressPercent = computed(() => {
  if (!props.progress) return '0.0'
  return props.progress.percentage.toFixed(1)
})

const progressMessage = computed(() => {
  if (!props.progress) return ''
  if (props.progress.percentage === 100) return 'Complete'
  return `Copying ${props.progress.currentFile} (${props.progress.filesDone}/${props.progress.totalFiles})`
})
</script>

<template>
  <div
    v-if="isVisible"
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
        {{ progress?.percentage === 100 ? 'Complete!' : 'Processing...' }}
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
</template>
