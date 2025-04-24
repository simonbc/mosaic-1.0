<script>
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { marked } from 'marked'

  import { createPageStore } from '../stores/pages.js'
  import { listRevisions, getLatestRevision, newRevision } from '../stores/revisions.js'
  import { shortcut } from '../actions/shortcut.js'

  export let docId = 'default'
  const page = createPageStore(docId)
  let content = ''
  let textareaEl
  let showPreview = true
  function togglePreview() {
    showPreview = !showPreview
  }

  onMount(async () => {
    const latest = await getLatestRevision(docId)
    if (latest) content = latest.content
    textareaEl?.focus()
  })

  onDestroy(async () => {
    await newRevision({ id: docId, content, published: get(page).published })
  })
</script>

<main
  class="split-container"
  use:shortcut={{ key: 'p', meta: true, onPress: togglePreview }}
>
  <div class="editor-container" class:full={!showPreview}>
    <textarea
      bind:this={textareaEl}
      bind:value={content}
      placeholder="Start writing..."
    />
  </div>
  <div class="preview-container" class:hidden={!showPreview}>
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
    transition: opacity 0.3s ease;
    opacity: 1;
  }

  .preview-container.hidden {
    opacity: 0;
    pointer-events: none;
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
