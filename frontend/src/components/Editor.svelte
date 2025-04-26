<script>
  import { onMount, onDestroy } from 'svelte'
  import { marked } from 'marked'

  import { createPageStore } from '../stores/pages.js'
  import { settings } from '../stores/settings.js'
  import { shortcut } from '../actions/shortcut.js'
  import { debounce } from '../utils/timing.js'

  export let docId
  export let selectedRevision
  export let revisions

  const page = createPageStore(docId)
  let content = ''
  let textareaEl
  let cursorPosition = 0
  let modified = false

  $: previewVisible = $settings.showPreview
  
  function togglePreview() {
    settings.update(s => ({ ...s, showPreview: !s.showPreview }))
  }

  async function saveRevision() {
    page.setCursorPosition(cursorPosition)
    if (!modified) return
    await revisions.create(content)
    modified = false
  }
  const debouncedSaveRevision = debounce(saveRevision, 500)

  function scrollTextareaToCaret(el) {
    if (!el) return
    const { selectionStart } = el
    // Scroll so caret is visible
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 16
    const paddingTop = parseInt(getComputedStyle(el).paddingTop) || 0
    const scrollPos = lineHeight * (el.value.substr(0, selectionStart).split('\n').length - 1)
    el.scrollTop = scrollPos - paddingTop
  }

  function updateCursorPosition() {
    cursorPosition = textareaEl?.selectionStart || 0
  }

  function handleInput(event) {
    updateCursorPosition()
    content = event.target.value
    modified = true
    debouncedSaveRevision()
  }

  onMount(async () => {
    if (selectedRevision) {
      content = selectedRevision.content
    } else {
      const latest = await revisions.getLatest()
      content = latest.content ?? ''
    }
    
    if (textareaEl) {
      textareaEl.focus()
    }
  })

  onDestroy(() => {
    debouncedSaveRevision()
  })

  $: if (textareaEl && $page.cursorPosition != null) {
    textareaEl.setSelectionRange($page.cursorPosition, $page.cursorPosition)
    scrollTextareaToCaret(textareaEl)
  }
</script>

<main
  class="split-container"
  use:shortcut={{ key: 'p', meta: true, onPress: togglePreview }}
>
  <div class="editor-container" class:full={!previewVisible}>
    <textarea
      bind:this={textareaEl}
      bind:value={content}
      placeholder="Start writing..."
      on:input={handleInput}
      on:click={updateCursorPosition}
      on:keyup={updateCursorPosition}
    />
  </div>
  <div class="preview-container" class:hidden={!previewVisible}>
    {@html marked(content)}
  </div>
</main>

<style>
  .split-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .editor-container {
    width: 50%;
    height: 100%;
    transition: width 0.3s ease;
  }

  .editor-container.full {
    width: 100%;
  }

  .preview-container {
    width: 50%;
    padding: 1rem;
    overflow-y: auto;
    background: #f9f9f9;
    border-left: 1px solid #ddd;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 1;
  }

  .preview-container.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(1rem);
  }

  textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    outline: none;
    padding: 1rem;
    font-size: 1rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    box-sizing: border-box;
  }
</style>
