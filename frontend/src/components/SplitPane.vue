<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  minLeftWidth: {
    type: Number,
    default: 20 // Percentage
  },
  minRightWidth: {
    type: Number,
    default: 20 // Percentage
  },
  initialLeftWidth: {
    type: Number,
    default: 60 // Percentage
  }
})

const leftWidth = ref(props.initialLeftWidth)
const isResizing = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const startResize = () => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  // Prevent text selection during drag
  document.body.style.userSelect = 'none'
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value || !containerRef.value) return
  
  const containerRect = containerRef.value.getBoundingClientRect()
  const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
  
  if (newLeftWidth >= props.minLeftWidth && newLeftWidth <= (100 - props.minRightWidth)) {
    leftWidth.value = newLeftWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  stopResize()
})
</script>

<template>
  <div 
    ref="containerRef" 
    class="flex flex-col md:flex-row h-full w-full overflow-hidden"
  >
    <!-- Left Pane -->
    <div 
      class="flex-shrink-0 flex flex-col h-full overflow-hidden transition-all duration-75"
      :style="{ width: isResizing ? `${leftWidth}%` : undefined }"
      :class="['w-full md:w-[60%]']"
    >
      <slot name="left"></slot>
    </div>

    <!-- Divider (Desktop only) -->
    <div 
      class="hidden md:flex w-2 cursor-col-resize bg-gray-100 hover:bg-blue-400 items-center justify-center z-10 transition-colors"
      @mousedown="startResize"
    >
      <div class="w-[2px] h-8 bg-gray-300 rounded"></div>
    </div>
    
    <!-- Divider (Mobile only - just a separator) -->
    <div class="md:hidden h-2 w-full bg-gray-100 border-y border-gray-200"></div>

    <!-- Right Pane -->
    <div 
      class="flex-grow flex flex-col h-full overflow-hidden"
      :style="{ width: isResizing ? `${100 - leftWidth}%` : undefined }"
    >
      <slot name="right"></slot>
    </div>
  </div>
</template>

<style scoped>
/* Override tailwind width on desktop if inline style is set via dragging */
@media (min-width: 768px) {
  .flex-shrink-0 {
    width: v-bind('leftWidth + "%"') !important;
  }
}
</style>
