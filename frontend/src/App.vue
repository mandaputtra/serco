<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

document.body.addEventListener("click", function (event) {
  event.preventDefault();
});
</script>

<template>
  <!-- Header -->
  <div class="header">
    <!-- navigation -->
    <div class="nav">
      <router-link to="/">{{ t("nav.home") }}</router-link>
      <router-link to="/about">{{ t("nav.about") }}</router-link>
    </div>
  </div>
  <!-- Page -->
  <div class="view">
    <router-view />
  </div>
</template>

<style lang="scss">
@import url("./assets/css/reset.css");
@import url("./assets/css/font.css");
</style>
