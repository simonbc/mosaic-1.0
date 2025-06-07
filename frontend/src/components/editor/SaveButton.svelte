<script>
    import { currentPost } from '@data/posts';
    import { editing } from '@data/uiStore';

    function toggleEditing() {
        editing.update((e) => !e)
    }
</script>

<button class="btn btn-primary" on:click={() => toggleEditing()}>
  {#if $currentPost.post.published}
    Publish
  {:else}
    Save draft
  {/if}
</button>