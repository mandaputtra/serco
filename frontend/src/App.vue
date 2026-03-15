<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";
import { useFileSystemStore } from '@/stores/fileSystem';
import ErrorBoundary from '@/components/ErrorBoundary.vue';

const { t } = useI18n();
const store = useFileSystemStore();

onMounted(() => {
  store.applyTheme();
});

const handleError = (error: Error) => {
  console.error('Application error:', error);
};
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <!-- Header -->
    <div class="header flex-none p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-20 transition-colors duration-200">
      <!-- navigation -->
      <div class="nav space-x-6 font-medium text-gray-600 dark:text-gray-300">
        <router-link to="/" class="hover:text-blue-600 dark:hover:text-blue-400 active:text-blue-800" active-class="text-blue-600 dark:text-blue-400">{{ t("nav.home") }}</router-link>
        <router-link to="/about" class="hover:text-blue-600 dark:hover:text-blue-400 active:text-blue-800" active-class="text-blue-600 dark:text-blue-400">{{ t("nav.about") }}</router-link>
      </div>
    </div>
    <!-- Page -->
    <div class="view flex-grow overflow-hidden relative">
      <ErrorBoundary @error="handleError">
        <router-view />
      </ErrorBoundary>
    </div>
  </div>
</template>

<style lang="scss">
@import url("./assets/css/reset.css");
@import url("./assets/css/font.css");
</style>
