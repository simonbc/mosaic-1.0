<script>
    import { currentPost } from "@data/posts";
</script>

<div class="publish-status">
    {#if $currentPost?.published}
        <span>Published</span>
        {:else}
        <span>Draft</span>
    {/if}
</div>