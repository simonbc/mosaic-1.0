<script>
  import { onMount, onDestroy } from 'svelte'
  import { marked } from 'marked'
  import { writable } from 'svelte/store'

  import { updatePage, loadPage } from '../data/pages.js'
  import { saveDraft, getDraft, deleteDraft } from '../data/draftsStore.js'
  import { pageData } from '../data/pagesStore.js'
  import { settings } from '../data/settingsStore.js'
  import { previewRevision, editing } from '../data/uiStore.js'
  import { shortcut } from '../actions/shortcut.js'
  import { debounce } from '../utils/timing.js'

  const showShortcuts = writable(false)
  const isMac = navigator.userAgentData?.platform === 'macOS' || /Mac/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : '^'

  function handleKeyDown(e) {
    if (e.metaKey) showShortcuts.set(true)
  }

  function handleKeyUp(e) {
    if (!e.metaKey) showShortcuts.set(false)
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  let title = $pageData.page.title;
  let content = $pageData.revision.content;

  let textareaEl
  let cursorPosition = null

  // Dynamically set textarea placeholder based on whether this is a riff page
  $: placeholderText = $pageData.page?.riffedFrom
    ? '> Start your riff here...'
    : '> Start writing...'

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

  function toggleEditing() {
        editing.update((e) => !e)
    }
  
  function togglePreview() {
    settings.update(s => ({ ...s, showPreview: !s.showPreview }))
  }

  function toggleShowRevisions() {
        settings.update(s => ({ ...s, showRevisions: !s.showRevisions }))
    }

  async function savePage() {
    if (title.trim() !== $pageData.page.title || content.trim() !== $pageData.revision.content) {
      updatePage($pageData.page.id, { title, content, cursorPosition });
      await deleteDraft($pageData.id)
      await loadPage($pageData.page.slug);
      previewRevision.set(null)
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
    if ($previewRevision) {
        content = $previewRevision.content;
        cursorPosition = 0;
    } else {
        const existingDraft = getDraft($pageData.page.id);
        if (existingDraft) {
            content = existingDraft.content;
            cursorPosition = existingDraft.cursorPosition ?? 0
        } else {
            content = $pageData.revision.content;
            cursorPosition = $pageData.cursorPosition ?? 0
        }
    }
    

    if (textareaEl) {
        textareaEl.focus()
    }
});

    onDestroy(() => {
        savePage()
    })
</script>

<main
  class="split-container"
  use:shortcut={{ key: 'p', meta: true, onPress: togglePreview }}
>
  <div class="editor-container" class:full={!previewVisible}>
    {#if $pageData.page?.riffedFrom}
      <p class="riff-info">
        <span>
          You’re riffing on 
          <em>"{$pageData.page.riffedFrom.title}"</em> 
          by 
          <strong>@{$pageData.page.riffedFrom.byline || $pageData.page.riffedFrom.handle}</strong>.
          Your words will live on their own page.
        </span>
        <a href={`/${$pageData.page.riffedFrom.handle}/${$pageData.page.riffedFrom.slug}`}
          target="_blank" rel="noopener" class="view-original-link">
          View original
        </a>
      </p>
    {/if}
    <div class="toolbar-container">
      <div class="editor-toolbar">
        {#if !$settings.showButton}
          <button on:click={toggleEditing} title="Save (Cmd+S)">
            Save <span class="shortcut-label" class:visible={$showShortcuts}>({modKey}E)</span>
          </button>
          <button 
            on:click={togglePreview} 
            title="Toggle Preview (Cmd+P)"
            class:active={$settings.showPreview}
          >
            Preview <span class="shortcut-label" class:visible={$showShortcuts}>({modKey}P)</span>
          </button>
          <button 
            on:click={toggleShowRevisions} 
            title="Toggle Revisions"
            class:active={$settings.showRevisions}
          >
            Version History <span class="shortcut-label" class:visible={$showShortcuts}>({modKey}H)</span>
          </button>
        {/if}
        <button
          class="toolbar-toggle-icon"
          title={$settings.showButton ? 'Show toolbar' : 'Hide toolbar'}
          on:click={() => settings.update(s => ({ ...s, showButton: !s.showButton }))}
          class:rotated={$settings.showButton}
        >
          ⌃
        </button>
      </div>
    </div>
    <input
      type="text"
      bind:value={title}
      placeholder="Page Title"
      class="title-input"
    />
    <textarea
      bind:this={textareaEl}
      bind:value={content}
      placeholder={placeholderText}
      on:input={handleInput}
    ></textarea>
    {#if $pageData.page?.riffedFrom && $pageData.revisions.length == 1}
      <div class="riff-return-link">
        <a href={`/${$pageData.page.riffedFrom.handle}/${$pageData.page.riffedFrom.slug}`}>
          Not ready to riff? Go back to reading →
        </a>
      </div>
    {/if}
  </div>
    <div class="preview-container" class:hidden={!previewVisible}>
        <h1 class="title-preview">{title}</h1>
        {@html marked(content)}
    </div>
</main>


<style>
  main {
    display: flex;
    flex-direction: row;
    height: 100vh;
    padding: 2rem;
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
    line-height: 1.6
  }

  textarea {
    flex: 1;
    width: 100%;
    height: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 1rem;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    padding: 0 3rem 1rem 0;
    line-height: 1.5;
  }

  button {
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
    position: relative;
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .editor-container {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .editor-container.full {
    width: 100%;
  }

  .preview-container {
    width: 50%;
    height: 100%;
    padding: 0 2rem 2rem 2rem;
    overflow-y: auto;
    border-left: 1px solid #ddd;

    opacity: 1;
  }

  .title-preview {
    font-size: 2rem;
    font-weight: bold;
    margin: 0 0 1rem 0;
    
  }

  .preview-container.hidden {
    width: 0;
    opacity: 0;
    pointer-events: none;
    transform: translateY(1rem);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-0.5rem); }
    to { opacity: 1; transform: translateY(0); }
  }

  .riff-info {
    animation: fadeIn 0.5s ease-in;
  }

  .riff-info {
    font-size: 0.9em;
    margin-bottom: 1.5rem;
    background: #f4f4f4;
    padding: 0.75rem 1rem;
    border-left: 3px solid #ccc;
    border-radius: 4px;
    color: #444;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }

  .view-original-link {
    font-size: 0.85em;
    color: #555;
    text-decoration: underline;
    white-space: nowrap;
  }

  .riff-return-link {
    text-align: right;
    margin-top: 0.5rem;
    font-size: 0.85em;
    color: #666;
  }

  .riff-return-link a {
    color: #444;
    text-decoration: underline;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .editor-toolbar button {
    font-size: 0.8rem;
    background: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .editor-toolbar button:hover {
    background: #f0f0f0;
  }

  .editor-toolbar button.active {
    background: #eee;
    border-color: #999;
  }

  button.toolbar-toggle-icon {
    border: 0;
    padding: 0;
    opacity: 0.6;
    align-self: center;
    background: none;
  }
  button.toolbar-toggle-icon:hover {
    background: none;
    opacity: 1;
  }
  button.toolbar-toggle-icon.rotated {
    transform: rotate(180deg);
  }
  .toolbar-container {
    position: absolute;
    top: 1rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 1;
  }

  .shortcut-label {
    display: inline-block;
    width: 3.5em;
    color: #999;
    font-size: 0.75em;
    margin-left: 0.25em;
    visibility: hidden;
  }
  .shortcut-label.visible {
    visibility: visible;
  }
</style>