<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = () => {
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="close"
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

        <div
          class="bg-gray-50 dark:bg-gray-700 p-3 rounded border dark:border-gray-600"
        >
          <h4 class="font-semibold mb-2">Keyboard Shortcuts:</h4>
          <ul class="space-y-1 text-xs">
            <li class="flex justify-between">
              <span
                ><kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >Ctrl</kbd
                >
                +
                <kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >A</kbd
                ></span
              >
              <span>Select all files</span>
            </li>
            <li class="flex justify-between">
              <span
                ><kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >Ctrl</kbd
                >
                +
                <kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >C</kbd
                ></span
              >
              <span>Copy selected paths</span>
            </li>
            <li class="flex justify-between">
              <span
                ><kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >F5</kbd
                ></span
              >
              <span>Refresh current directory</span>
            </li>
            <li class="flex justify-between">
              <span
                ><kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >Delete</kbd
                ></span
              >
              <span>Clear selection</span>
            </li>
            <li class="flex justify-between">
              <span
                ><kbd class="bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >Esc</kbd
                ></span
              >
              <span>Close modals / Clear selection</span>
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
          @click="close"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Got it
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
