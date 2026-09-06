import { it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import MarkdownRenderer from '../src/MarkdownRenderer.vue'
import TokenView from '../src/components/TokenTree.vue'
import { createMarkdownEngine, defineTag } from '../src/core'

it('renders GFM and math through the Vue component', () => {
  const wrapper = mount(MarkdownRenderer, { props: { content: '###### Heading\n\n- [x] done\n\n| X | Y |\n| --- | ---: |\n| $x^2$ | **bold** |' } })
  expect(wrapper.find('h6').text()).toBe('Heading')
  expect(wrapper.find('input').element.checked).toBe(true)
  expect(wrapper.text()).not.toContain('[x]')
  expect(wrapper.find('.katex').exists()).toBe(true)
  expect(wrapper.findAll('td')[1].attributes('style')).toContain('right')
  wrapper.unmount()
})
it('preserves earlier code block identity on content updates', async () => {
  const content = '```js\nlet x = 1\n```\n\n'
  const wrapper = mount(MarkdownRenderer, { props: { content: content + 'First' } })
  const code = wrapper.find('code').element
  await wrapper.setProps({ content: content + 'First second' })
  expect(wrapper.find('code').element).toBe(code)
  wrapper.unmount()
})
it('copies original code and table Markdown', async () => {
  vi.useFakeTimers()
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  const table = '| X |\n| --- |\n| a |'
  const wrapper = mount(MarkdownRenderer, { props: { content: '```ts\nconst x = 1\n```\n\n' + table } })
  await wrapper.find('[aria-label="Copy code"]').trigger('click')
  expect(writeText).toHaveBeenCalledWith('const x = 1')
  expect(wrapper.find('[aria-label="Copy code"] [data-icon="check"]').exists()).toBe(true)
  await wrapper.find('[aria-label="Copy table Markdown"]').trigger('click')
  expect(writeText.mock.calls[1][0].trim()).toBe(table)
  expect(wrapper.find('[aria-label="Copy table Markdown"] [data-icon="check"]').exists()).toBe(true)
  await vi.advanceTimersByTimeAsync(2000)
  expect(wrapper.findAll('[data-icon="check"]')).toHaveLength(0)
  expect(wrapper.findAll('[data-icon="copy"]')).toHaveLength(2)
  wrapper.unmount(); vi.unstubAllGlobals(); vi.useRealTimers()
})
it('passes custom components their nested content and isolated engine', () => {
  const engine = createMarkdownEngine({ extensions: [defineTag('callout')] })
  const component = defineComponent({ props: ['token', 'engine', 'components', 'theme'], setup: props => () => h('aside', { 'data-callout': props.token.attributes.title }, [h(TokenView, { tokens: props.token.tokens, engine: props.engine, components: props.components, theme: props.theme })]) })
  const wrapper = mount(MarkdownRenderer, { props: { content: '<callout title="Note">\n**Text\n</callout>', engine, components: { callout: component } } })
  expect(wrapper.find('aside').attributes('data-callout')).toBe('Note')
  expect(wrapper.find('strong').text()).toBe('Text')
  wrapper.unmount()
})
it('supports server rendering without running Mermaid', async () => {
  const html = await renderToString(h(MarkdownRenderer, { content: '**Hello**\n\n```mermaid\ngraph TD; A-->B\n```' }))
  expect(html).toContain('<strong>Hello</strong>')
  expect(html).toContain('Diagram')
  expect(html).not.toContain('aria-roledescription=')
})
