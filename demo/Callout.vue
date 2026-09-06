<script setup lang="ts">
import type { Component } from 'vue'
import { TokenView } from 'streammd/vue'
import type { TagToken, MarkdownEngine } from 'streammd'
defineProps<{ token: TagToken; engine: MarkdownEngine; components: Record<string, Component>; theme: 'light' | 'dark' }>()
</script>
<template>
  <aside class="callout" data-callout>
    <strong>{{ token.attributes.title || 'Note' }}</strong>
    <TokenView :tokens="token.tokens" :engine="engine" :components="components" :theme="theme" />
  </aside>
</template>
<style scoped>.callout { border-left: 3px solid #6795bb; padding: .75rem 1rem; margin: 1rem 0; }</style>
