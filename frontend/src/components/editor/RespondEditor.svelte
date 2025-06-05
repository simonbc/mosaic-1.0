<script>
    import { onMount } from 'svelte';
    import PostEditor from '@components/editor/PostEditor.svelte';
    import { createPost, currentPost } from '@data/posts.js';
    import { currentSlug, navigateTo } from '../../routing.js'
    import { responding } from '@data/uiStore.js'
    import { settings } from '@data/settingsStore.js'

    onMount(async () => {
        if ($responding) {
            const newSlug = await createPost({ parentId: $currentSlug });
            responding.set(false)
            await settings.update(s => ({ ...s, showPreview: !s.showPreview }))
            navigateTo(newSlug)
        }
    });
</script>

<div>
    {#if $currentPost !== undefined}
        <PostEditor />
    {/if}
</div>