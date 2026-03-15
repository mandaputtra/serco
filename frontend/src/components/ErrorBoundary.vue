<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err: unknown) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  emit('error', err instanceof Error ? err : new Error(String(err)))
  return false // Prevent error from propagating
})

const reset = () => {
  hasError.value = false
  errorMessage.value = ''
  // Reload page to recover
  window.location.reload()
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div class="text-center">
          <svg
            class="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ errorMessage }}
          </p>
          <button
            @click="reset"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  </div>
  <slot v-else />
</template>
