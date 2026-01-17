<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// This was preventing clicks, removing it to allow UI interaction
// document.body.addEventListener("click", function (event) {
//   event.preventDefault();
// });
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-gray-100">
    <!-- Header -->
    <div class="header flex-none p-4 bg-white border-b shadow-sm z-20">
      <!-- navigation -->
      <div class="nav space-x-6 font-medium text-gray-600">
        <router-link to="/" class="hover:text-blue-600 active:text-blue-800" active-class="text-blue-600">{{ t("nav.home") }}</router-link>
        <router-link to="/about" class="hover:text-blue-600 active:text-blue-800" active-class="text-blue-600">{{ t("nav.about") }}</router-link>
      </div>
    </div>
    <!-- Page -->
    <div class="view flex-grow overflow-hidden relative">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
@import url("./assets/css/reset.css");
@import url("./assets/css/font.css");
</style>
