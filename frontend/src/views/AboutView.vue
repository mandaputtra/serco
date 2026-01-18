<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { BrowserOpenURL } from '../../wailsjs/runtime'

const { t } = useI18n();

const openWebsite = () => {
  BrowserOpenURL("https://mandaputtra.id")
}
</script>

<template>
  <div class="about flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 overflow-y-auto">
    <div class="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden my-auto">
      <!-- Header -->
      <div class="bg-blue-600 p-8 text-center">
        <h1 class="text-3xl font-bold text-white mb-2">File Search & Copy</h1>
        <p class="text-blue-100 text-lg">A powerful and efficient file management tool</p>
      </div>

      <!-- Content -->
      <div class="p-8 space-y-6">
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2">About the Software</h2>
          <p class="text-gray-600 leading-relaxed">
            This application allows users to easily search, select, and copy files across their system with a modern dual-pane interface. Built with Wails (Go + Vue.js), it offers high performance and native capabilities.
          </p>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2">Developer</h2>
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">Created by:</span>
            <span class="font-medium text-gray-800">Manda Putra</span>
          </div>
          <div>
            <button 
              @click="openWebsite" 
              class="text-blue-600 hover:text-blue-800 hover:underline flex items-center transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              https://mandaputtra.id
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2">License</h2>
          <div class="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600 font-mono max-h-64 overflow-y-auto">
            <p class="mb-2 font-bold">MIT License</p>
            <p class="mb-2">Copyright (c) 2024 Manda Putra</p>
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p class="mt-2">
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="bg-gray-50 p-4 text-center text-gray-500 text-sm border-t">
        Version 1.0.0
      </div>
    </div>
  </div>
</template>
