<script setup lang="ts">
import { ref } from 'vue'
import type { Tokens } from 'marked'
import type { MarkdownEngine } from '../parser'
import ExpandDialog from './ExpandDialog.vue'
import { useCopy } from '../utils/useCopy'
import ControlIcon from './ControlIcon.vue'
const props = defineProps<{ token: Tokens.Table; theme: 'light' | 'dark'; engine: MarkdownEngine }>()
const renderInline = (tokens: import('marked').Token[]) => props.engine.renderInline(tokens)
const expanded = ref(false)
const { copy, copied, error } = useCopy()
const align = (index: number) => props.token.align[index] || undefined
</script>
<template>
  <div class="vmr-table-block">
    <div class="vmr-actions">
      <button type="button" class="vmr-icon-button" aria-label="Copy table Markdown" :title="copied ? 'Copied' : 'Copy table Markdown'" @click="copy(token.raw)"><ControlIcon :name="copied ? 'check' : 'copy'" /><span class="vmr-sr-only" aria-live="polite">{{ copied ? 'Copied' : '' }}</span></button>
      <button type="button" class="vmr-icon-button" aria-label="Expand table" title="Expand table" @click="expanded = true"><ControlIcon name="expand" /></button>
    </div>
    <div class="vmr-table-scroll">
      <table>
        <thead><tr><th v-for="(cell, i) in token.header" :key="i" :style="{ textAlign: align(i) }" scope="col" v-html="renderInline(cell.tokens)" /></tr></thead>
        <tbody><tr v-for="(row, i) in token.rows" :key="i"><td v-for="(cell, j) in row" :key="j" :style="{ textAlign: align(j) }" v-html="renderInline(cell.tokens)" /></tr></tbody>
      </table>
    </div>
    <p v-if="error" role="status">{{ error }}</p>
    <ExpandDialog :open="expanded" title="Table preview" :theme="theme" @close="expanded = false">
      <table>
        <thead><tr><th v-for="(cell, i) in token.header" :key="i" :style="{ textAlign: align(i) }" scope="col" v-html="renderInline(cell.tokens)" /></tr></thead>
        <tbody><tr v-for="(row, i) in token.rows" :key="i"><td v-for="(cell, j) in row" :key="j" :style="{ textAlign: align(j) }" v-html="renderInline(cell.tokens)" /></tr></tbody>
      </table>
    </ExpandDialog>
  </div>
</template>
