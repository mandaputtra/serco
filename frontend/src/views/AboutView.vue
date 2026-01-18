<script setup lang="ts">
import { BrowserOpenURL } from '../../wailsjs/runtime'

const openWebsite = () => {
  BrowserOpenURL('https://mandaputtra.id')
}
</script>

<template>
  <div
    class="about flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto transition-colors duration-200"
  >
    <div
      class="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden my-auto transition-colors duration-200"
    >
      <!-- Header -->
      <div
        class="bg-blue-600 dark:bg-blue-700 p-8 text-center transition-colors duration-200"
      >
        <h1 class="text-3xl font-bold text-white mb-2">File Search & Copy</h1>
        <p class="text-blue-100 text-lg">
          A powerful and efficient file management tool
        </p>
      </div>

      <!-- Content -->
      <div class="p-8 space-y-6">
        <div class="space-y-4">
          <h2
            class="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2"
          >
            About the Software
          </h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            This application allows users to easily search, select, and copy
            files across their system with a modern dual-pane interface. Built
            with Wails (Go + Vue.js), it offers high performance and native
            capabilities.
          </p>
        </div>

        <div class="space-y-4">
          <h2
            class="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2"
          >
            Developer
          </h2>
          <div class="flex items-center space-x-2">
            <span class="text-gray-600 dark:text-gray-400">Created by:</span>
            <span class="font-medium text-gray-800 dark:text-white"
              >Manda Putra</span
            >
          </div>
          <div>
            <button
              @click="openWebsite"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center transition-colors"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              https://mandaputtra.id
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <h2
            class="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2"
          >
            License
          </h2>
          <div
            class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 font-mono max-h-64 overflow-y-auto"
          >
            <p class="mb-2 font-bold text-gray-800 dark:text-gray-200">
              MIT License
            </p>
            <p class="mb-2">Copyright (c) 2024 Manda Putra</p>
            <p>
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files (the "Software"), to deal in the Software without
              restriction, including without limitation the rights to use, copy,
              modify, merge, publish, distribute, sublicense, and/or sell copies
              of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p class="mt-2">
              The above copyright notice and this permission notice shall be
              included in all copies or substantial portions of the Software.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="bg-gray-50 dark:bg-gray-700 p-4 text-center text-gray-500 dark:text-gray-400 text-sm border-t dark:border-gray-600"
      >
        Version 1.0.0
      </div>
    </div>
  </div>
</template>
