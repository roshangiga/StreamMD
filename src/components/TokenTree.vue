<script setup lang="ts">
import type { Token, Tokens } from 'marked'
import { computed, type Component } from 'vue'
import { defaultEngine, renderMath, type MathToken, type MarkdownEngine } from '../parser'
import CodeBlock from './CodeBlock.vue'
import TableBlock from './TableBlock.vue'
defineOptions({ name: 'TokenTree' })
const props = withDefaults(defineProps<{ tokens: Token[]; theme?: 'light' | 'dark'; mermaid?: boolean; engine?: MarkdownEngine; components?: Record<string, Component> }>(), { theme: 'light', mermaid: true })
const engine = computed(() => props.engine || defaultEngine)
const renderInline = (tokens: Token[]) => engine.value.renderInline(tokens)
const children = (token: Token) => (token as Token & { tokens?: Token[] }).tokens
</script>

<template>
  <div class="vmr-token-tree">
    <template v-for="(token, index) in tokens" :key="`${index}:${token.type}`">
      <component v-if="components?.[token.type]" :is="components[token.type]" :token="token" :engine="engine" :components="components" :theme="theme" />
      <p v-else-if="token.type === 'paragraph'" v-html="renderInline((token as Tokens.Paragraph).tokens)" />
      <span v-else-if="token.type === 'text'" v-html="renderInline((token as Tokens.Text).tokens || [token])" />
      <component v-else-if="token.type === 'heading'" :is="`h${(token as Tokens.Heading).depth}`" v-html="renderInline((token as Tokens.Heading).tokens)" />
      <CodeBlock v-else-if="token.type === 'code'" :code="(token as Tokens.Code).text" :lang="(token as Tokens.Code).lang" :theme="theme" :mermaid="mermaid" />
      <component v-else-if="token.type === 'list'" :is="(token as Tokens.List).ordered ? 'ol' : 'ul'" :start="(token as Tokens.List).ordered ? (token as Tokens.List).start : undefined">
        <li v-for="(item, i) in (token as Tokens.List).items" :key="i" :class="{ 'vmr-task': item.task }">
          <input v-if="item.task" type="checkbox" :checked="item.checked" disabled :aria-label="item.checked ? 'Completed task' : 'Incomplete task'">
          <TokenTree :tokens="item.tokens" :theme="theme" :mermaid="mermaid" :engine="engine" :components="components" />
        </li>
      </component>
      <blockquote v-else-if="token.type === 'blockquote'"><TokenTree :tokens="(token as Tokens.Blockquote).tokens" :theme="theme" :mermaid="mermaid" :engine="engine" :components="components" /></blockquote>
      <hr v-else-if="token.type === 'hr'">
      <div v-else-if="token.type === 'blockKatex'" class="vmr-math" v-html="renderMath((token as MathToken).text)" />
      <TableBlock v-else-if="token.type === 'table'" :token="token as Tokens.Table" :theme="theme" :engine="engine" />
      <pre v-else-if="token.type === 'html'" class="vmr-literal">{{ token.raw }}</pre>
      <template v-else-if="token.type === 'space' || token.type === 'checkbox'" />
      <TokenTree v-else-if="children(token)" :tokens="children(token)!" :engine="engine" :components="components" :theme="theme" :mermaid="mermaid" />
      <span v-else>{{ token.raw }}</span>
    </template>
  </div>
</template>
