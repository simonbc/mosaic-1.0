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
  
  function togglePreview() {
    settings.update(s => ({ ...s, showPreview: !s.showPreview }))
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
        <a href={`http://localhost:8000/${$pageData.page.riffedFrom.handle}/${$pageData.page.riffedFrom.slug}`}
          target="_blank" rel="noopener" class="view-original-link">
          View original →
        </a>
      </p>
    {/if}
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
    />
    {#if $pageData.page?.riffedFrom && $pageData.revisions.length == 1}
      <div class="riff-return-link">
        <a href={`http://localhost:8000/${$pageData.page.riffedFrom.handle}/${$pageData.page.riffedFrom.slug}`}>
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
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .editor-container {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
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
    transition: opacity 0.3s ease, transform 0.3s ease;
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

  .riff-info,
  .riff-echo {
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
</style>
