<script>
    import { currentPost } from "@data/posts";
    import { API_BASE } from "../../env";
</script>

<div class="publish-status">
    {#if $currentPost.post.published}
        <span>Published</span>
    {/if}
</div>

<style>
    .publish-status {
      text-transform: uppercase;
      color: var(--text-muted);
      opacity: 0.5;
      flex-grow: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      line-height: 1;
    }
</style>