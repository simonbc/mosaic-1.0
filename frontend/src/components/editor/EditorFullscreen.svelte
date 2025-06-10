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

  function autosize(node) {
    const resize = () => {
      node.style.height = "auto";
      const maxHeight = window.innerHeight - 128;
      node.style.height = Math.min(node.scrollHeight, maxHeight) + "px";
    };

    resize();
    node.addEventListener("input", resize);

    return {
      destroy() {
        node.removeEventListener("input", resize);
      },
    };
  }
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
    <div class="editor-container">
      <textarea
        bind:value={content}
        placeholder="Start writing..."
        class="editor"
        use:autosize
        spellcheck="false"
        autofocus
      />
      <p class="word-count">{content.trim().split(/\s+/).length} words</p>
    </div>
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

  .editor-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 2rem;
  }

  .word-count {
  text-align: center;
  font-size: 0.85rem;
  color: #999;
  margin-top: 1rem;
}

  textarea.editor {
    width: 100%;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
    max-width: 768px;
    min-height: 130px;
    resize: none;
    box-sizing: border-box;
    padding: 1.5rem;
    line-height: 1.9;
    font-family: var(--font-mono);
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 25px;
    background: #fff;
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