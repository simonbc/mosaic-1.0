<script>
  import { onMount, onDestroy } from 'svelte'
  import { marked } from 'marked'

  import { updatePage, loadPage } from '../data/pages.js'
  import { saveDraft, getDraft, deleteDraft } from '../data/draftsStore.js'
  import { pageData } from '../data/pagesStore.js'
  import { settings } from '../data/settingsStore.js'
  import { previewRevision } from '../data/uiStore.js'
  import { shortcut } from '../actions/shortcut.js'
  import { debounce } from '../utils/timing.js'

  let title = $pageData.page.title;
  let content = $pageData.revision.content;

  let textareaEl
  let cursorPosition = null

  $: previewVisible = $settings.showPreview

  $: if (textareaEl && $pageData.page.cursorPosition != null) {
    textareaEl.setSelectionRange($pageData.page.cursorPosition, $pageData.page.cursorPosition)
    scrollTextareaToCaret(textareaEl)
  }

  function scrollTextareaToCaret(el) {
    if (!el) return
    const { selectionStart } = el
    // Scroll so caret is visible
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 16
    const paddingTop = parseInt(getComputedStyle(el).paddingTop) || 0
    const scrollPos = lineHeight * (el.value.substr(0, selectionStart).split('\n').length - 1)
    el.scrollTop = scrollPos - paddingTop
  }
  
  function togglePreview() {
    settings.update(s => ({ ...s, showPreview: !s.showPreview }))
  }

  async function savePage() {
    if (title.trim() !== $pageData.page.title || content.trim() !== $pageData.revision.content) {
      console.log('Cursor position:', cursorPosition)
      updatePage($pageData.page.id, { title, content, cursorPosition });
      await deleteDraft($pageData.id)
      await loadPage($pageData.page.slug);
    }
  }

  function saveCursorPosition() {
    cursorPosition = textareaEl?.selectionStart || 0
  }

  const debouncedSaveDraft = debounce(() => {
  if ($pageData) {
    saveDraft($pageData.page.id, {
      content,
      cursorPosition
    });
  }
}, 500);

  function handleInput(event) {
    content = event.target.value
    debouncedSaveDraft()
    saveCursorPosition()
  }

  onMount(() => {
  if ($pageData) {
    const existingDraft = getDraft($pageData.page.id);
    if (existingDraft) {
      content = existingDraft.content;
      cursorPosition = existingDraft.cursorPosition ?? 0
    } else {
      content = $pageData.revision.content;
      cursorPosition = $pageData.cursorPosition ?? 0
    }
  }
});

  onMount(async () => {
    previewRevision.set(null)
    

    if (textareaEl) {
      textareaEl.focus()
    }
  })

  onDestroy(() => {
    savePage()
  })
</script>

<main
  class="split-container"
  use:shortcut={{ key: 'p', meta: true, onPress: togglePreview }}
>
  <div class="editor-container" class:full={!previewVisible}>
    <input
      type="text"
      bind:value={title}
      placeholder="Page Title"
      class="title-input"
    />
    <textarea
      bind:this={textareaEl}
      bind:value={content}
      placeholder="Start writing..."
      on:input={handleInput}
    />
  </div>
  <div class="preview-container" class:hidden={!previewVisible}>
    {@html marked(content)}
  </div>
</main>


<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 2rem;
    background: #fafafa;
    color: #222;
  }

  .title-input {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-family: inherit;
  }

  textarea {
    flex: 1;
    width: 100%;
    height: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 1.1rem;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    padding: 1rem 0;
    line-height: 1.5;
  }

  button {
    margin-top: 1rem;
    align-self: flex-start;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background: none;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #eee;
  }

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
</style>
