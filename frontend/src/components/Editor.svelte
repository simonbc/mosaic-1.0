<script>
  import { createPageStore } from '../stores/page'
  import { onMount } from 'svelte'

  export let docId = 'default'
  const content = createPageStore(docId)
  let textareaEl

  onMount(async () => {
    textareaEl?.focus()
  });
</script>

<main>
  <div class="editor-container">
    <textarea
      bind:this={textareaEl}
      bind:value={$content}
      placeholder="Start writing..."
    />
  </div>
</main>

<style>
  /* Make the main container fill the viewport height */
  main {
    height: 100vh;
  }

  .editor-container {
    height: 100%;
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
