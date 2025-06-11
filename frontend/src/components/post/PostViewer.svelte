<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';

    import { API_BASE } from '../../env.js'
    import PublishStatus from './PublishStatus.svelte';
    import EditButton from './EditButton.svelte';
    import PublishButton from './PublishButton.svelte';
    import PostMeta from './PostMeta.svelte'

    import { previewRevision, headerNav } from '@data/uiStore.js';
    import { currentPost } from '@data/posts.js';

    onMount(async () => {
        headerNav.set([
            { id: 'status', component: PublishStatus },
            { id: 'edit', component: EditButton },
            { id: 'publish', component: PublishButton },
        ]);
    })
</script>

<section class="post-section">
    <div class="post-content">
      {#if $currentPost.parent}
        <a
          class="post-parent-link"
          href="{API_BASE}/@{$currentPost.parent.handle}/{$currentPost.parent.slug}"
        >
          ← responding to
          <span class="post-parent-handle"
            >@{$currentPost.parent.handle}</span
          >
        </a>
        {/if}
        {@html marked.parse(
            $previewRevision 
                ? $previewRevision.content
                : $currentPost.revision.content
      )}
      <PostMeta post={$currentPost.post} />
      {#if $currentPost.post.published}
        <div class="post-respond">
          <a
            class="btn btn-link btn-sm"
            href="/@{$currentPost.post.handle}/{$currentPost.post.slug}/respond"
            >Respond</a
          >
        </div>
      {/if}
      {#if $currentPost.responses}
        <div class="post-responses-container">
          {#each $currentPost.responses as response}
            <div class="post-response-wrapper">
              <div class="post-content">
                <a
                  href="/@{response.handle}/{response.slug}"
                  class="post-response-link"
                >
                  {response.content}
                </a>
                <PostMeta post={{ ... response, updatedAt: response.updated_at}} />
              </div>
            </div>
          {/each}
        </div>
        {/if}
    </div>
</section>
