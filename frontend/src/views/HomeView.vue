<script setup lang="ts">
import { useI18n } from "vue-i18n";

import HelloWorld from "@/components/HelloWorld.vue";

const { t } = useI18n();
</script>

<template>
  <div class="home">
    <HelloWorld :msg="t('homepage.welcome')" />
  </div>
</template>
