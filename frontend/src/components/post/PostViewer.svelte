<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';

    import PublishStatus from './PublishStatus.svelte';
    import EditButton from './EditButton.svelte';
    import PublishButton from './PublishButton.svelte';

    import { previewRevision, headerButtons } from '@data/uiStore.js';
    import { currentPost } from '@data/posts.js';
    import { API_BASE } from '../../env.js'

    onMount(async () => {
        headerButtons.set([
            { id: 'status', component: PublishStatus },
            { id: 'edit', component: EditButton },
            { id: 'publish', component: PublishButton },
        ]);
    })
</script>

<section class="post-section">
    <div class="post-content">
        {@html marked.parse(
            $previewRevision 
                ? $previewRevision.content
                : $currentPost.revision.content
      )}
      <div class="post-meta">
        {new Date($currentPost.post.updatedAt).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false
        })} · {new Date($currentPost.post.updatedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        {$currentPost.byline ? ` · ${$currentPost.byline}` : ''}
        {#if $currentPost.parent}
         · <a href="{API_BASE}/@{$currentPost.parent.handle}/{$currentPost.parent.slug}">{$currentPost.parent.id}</a>
        {/if}
      </div>
    </div>
</section>
