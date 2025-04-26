<script>
  import { onMount } from 'svelte'
  import { summarizeChange } from '../utils/diff.js'

  export let docId
  export let onChangeRevision = (rev) => {}
  export let selectedRevision
  export let revisions
  
  let viewedRevision = null

  onMount(() => {
    revisions.refresh()
  })

  async function restore(rev) {
    const newRev = await revisions.restore(rev)
    onChangeRevision(newRev)
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString()
  }
</script>

<style>
  .revisions {
    position: fixed;
    top: 0;
    right: 0;
    width: 260px;
    height: 100vh;
    overflow-y: auto;
    background: #fafafa;
    border-left: 1px solid #ccc;
    padding: 1rem;
    font-family: system-ui, sans-serif;
    font-size: 0.75rem;
  }

  .revisions h2 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }

  .revision {
    margin-left: -0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid transparent;
    transition: background 0.2s, border-color 0.2s;
    cursor: pointer;
  }

  .revision:hover {
    background: #f0f0f0;
    border-color: #ddd;
  }

  .revision.selected {
    background: #e6f0ff;
  }

  .revision-diff {
    font-size: 0.7rem;
    font-weight: 700;
  }

  .restore-button-container {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 1000;
    width: 260px;
    padding: 1rem;
    border-left: 1px solid #ccc;
    background-color: #fff;
    display: flex;
    justify-content: end;
}

.restore-button {
  background: #555;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

</style>

<div class="revisions">
  <h2>Version history</h2>
  {#if $revisions.length === 0}
    <p>No revisions yet.</p>
  {:else}
    {#each $revisions as rev, i}
      <div
        class="revision"
        class:selected={viewedRevision === rev}
        on:click={() => { viewedRevision = rev; onChangeRevision(rev); }}
      >
        <div>{formatDate(rev.timestamp)}</div>
        <div class="revision-diff">
          <span style="color: green;">+{summarizeChange(rev.content, $selectedRevision?.content)['+']}</span>
          <span style="color: red;">−{summarizeChange(rev.content, $selectedRevision?.content)['-']}</span>
        </div>
      </div>
    {/each}
    <div class="restore-button-container">
      <button class="restore-button" on:click={() => restore(viewedRevision)}>
        Restore revision
      </button>
    </div>
  {/if}
</div>