<script setup lang="ts">
const props = defineProps<{
  show: boolean
  message: string
}>()
</script>

<template>
  <transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-8 right-8 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium"
    >
      {{ message }}
    </div>
  </transition>
</template>
