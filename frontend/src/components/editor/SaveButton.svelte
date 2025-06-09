<script>
    import { currentPost } from '@data/posts';
    import { editing, cmdState } from '@data/uiStore';

    function toggleEditing() {
        editing.update((e) => !e)
    }
</script>

<button class="btn btn-primary" class:cmd-visible={$cmdState.cmd} on:click={() => toggleEditing()}>
  <span class="btn-label">
    {#if $currentPost.post.published}
      Publish
    {:else}
      Save draft
    {/if}
  </span>
  {#if $cmdState.showHint}
    <span class="shortcut-hint">⌘E</span>
  {/if}
</button>
