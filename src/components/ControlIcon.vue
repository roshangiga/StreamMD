<script setup lang="ts">
defineProps<{ name: 'copy' | 'check' | 'expand' }>()
</script>
<template>
  <svg :data-icon="name" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <template v-if="name === 'copy'"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></template>
    <path v-else-if="name === 'check'" d="m5 12 4 4L19 6" />
    <path v-else d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
  </svg>
</template>
