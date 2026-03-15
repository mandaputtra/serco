<script setup lang="ts">
import { computed } from 'vue'
import { getFileName } from '@/utils/path'

const props = defineProps<{
  selectedPaths: Set<string>
  destinationPath: string | null
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const selectionList = computed(() => Array.from(props.selectedPaths))

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
    @click.self="cancel"
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
            {{ destinationPath }}
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            Files to Copy ({{ selectedPaths.size }})
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
          @click="cancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          @click="confirm"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Confirm Copy
        </button>
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
