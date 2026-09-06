import { ref, onBeforeUnmount } from 'vue'
export function useCopy() {
  const copied = ref(false)
  const error = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  onBeforeUnmount(() => clearTimeout(timer))
  async function copy(text: string) {
    error.value = ''
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, 2000)
    } catch { error.value = 'Copy failed. Select and copy the content manually.' }
  }
  return { copy, copied, error }
}
