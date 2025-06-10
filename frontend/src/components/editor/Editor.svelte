<script>
  import { onMount } from "svelte";

  let content = "";
  let showPreview = false;

  // Load from localStorage
  onMount(() => {
    const saved = localStorage.getItem("mosaic-draft");
    if (saved) content = saved;
  });

  // Save to localStorage on input
  $: localStorage.setItem("mosaic-draft", content);
</script>

<main>
  <div class="controls">
    <button on:click={() => showPreview = !showPreview}>
      {showPreview ? "Edit" : "Preview"}
    </button>
  </div>

  {#if showPreview}
    <div class="preview" bind:this={previewContainer}>
      {@html marked.parse(content)}
    </div>
  {:else}
    <textarea
      bind:value={content}
      placeholder="Start writing..."
      class="editor"
      spellcheck="false"
      autofocus
    />
    <div id="typewriter-marker" style="height: 0;"></div>
  {/if}
</main>

<style>
  main {
    
  }

  .controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
  }

  button {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    background: #eee;
    border: none;
    cursor: pointer;
  }

  textarea.editor {
    width: 100vw;
    height: calc(100vh - 120px);
    padding: 20vh calc(50vw - 30ch);
    box-sizing: border-box;
    resize: none;
    overflow-y: auto;
    display: block;
    line-height: 1.6;
    font-family: var(--font-mono);
    font-size: 1rem;
    border: none;
    background: transparent;
    color: #222;
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .preview {
    white-space: pre-wrap;
    line-height: 1.6;
    font-family: serif;
    font-size: 1rem;
    color: #222;
  }
</style>