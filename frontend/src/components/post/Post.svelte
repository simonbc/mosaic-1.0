<script>
    import PostEditor from '../editor/PostEditor.svelte'
    import PostViewer from './PostViewer.svelte'
    import NotFound from '../NotFound.svelte'

    import { currentPost } from '@data/posts.js'
    import { currentSlug } from '../../routing.js'
    import { shortcut } from '../../actions/shortcut.js'
    import { editing, responding } from '@data/uiStore.js'

    function toggleEditing() {
        editing.update((e) => !e)
    }
</script>

{#if $currentPost !== undefined}
    <article class="post">
        {#if $currentPost || $responding && $currentSlug}
            <div class="post-shortcuts" use:shortcut={{ key: 'e', meta: true, onPress: () => toggleEditing() }}>
                {#if $editing || $responding}
                    <PostEditor />
                {:else}
                    <PostViewer />
                {/if}
            </div>
        {:else}
            <NotFound />
        {/if}
    </article>
{/if}

<style>
    .post-shortcuts {
        width: 100%;
    }
</style>