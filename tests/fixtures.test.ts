import { it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { profiles, makeFixture } from '../benchmarks/fixtures/index.mjs'
import { createMarkdownEngine, defineTag } from '../src/core'
import MarkdownRenderer from '../src/MarkdownRenderer.vue'
import TokenView from '../src/components/TokenTree.vue'
const engine = createMarkdownEngine({ extensions: [defineTag('callout')] })
const Callout = defineComponent({ props: ['token', 'engine', 'components', 'theme'], setup: props => () => h('aside', { 'data-callout': '' }, h(TokenView, { tokens: props.token.tokens, engine: props.engine, components: props.components, theme: props.theme })) })
it.each(profiles)('renders the complete %s fixture with expected element counts', profile => {
  const fixture = makeFixture(profile, 10)
  const wrapper = mount(MarkdownRenderer, { props: { content: fixture.source, engine, components: { callout: Callout } } })
  for (const [selector, count] of Object.entries(fixture.expectedCounts)) {
    if (selector.includes('.vmr-mermaid')) continue // Actual SVG checks run in the browser suite.
    expect(wrapper.findAll(selector), selector).toHaveLength(count)
  }
  expect(wrapper.findAll('.katex-error')).toHaveLength(0)
  expect(wrapper.text()).toContain('DOCUMENT_COMPLETE')
  wrapper.unmount()
})
