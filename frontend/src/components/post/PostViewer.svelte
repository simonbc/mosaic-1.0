<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';

    import { API_BASE } from '../../env.js'
    import PublishStatus from './PublishStatus.svelte';
    import DeleteButton from './DeleteButton.svelte';
    import EditButton from './EditButton.svelte';
    import PublishButton from './PublishButton.svelte';
    import PostMeta from './PostMeta.svelte'

    import { previewRevision, headerNav } from '@data/uiStore.js';
    import { currentPost } from '@data/posts.js';

    onMount(async () => {
        headerNav.set([
            { id: 'status', component: PublishStatus },
            { id: 'delete', component: DeleteButton },
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
      <PostMeta post={$currentPost.post} />
    </div>
</section>
