<script>
    import { onMount } from 'svelte'
    import PostEditor from '../editor/PostEditor.svelte'
    import PostViewer from './PostViewer.svelte'
    import NotFound from '../NotFound.svelte'
    import ExportMenu from '../ExportMenu.svelte'

    import { currentPost } from '@data/posts.js'
    import { shortcut } from '../../actions/shortcut.js'
    import { editing, footerNav } from '@data/uiStore.js'

    function toggleEditing() {
        editing.update((e) => !e)
    }

    onMount(() => {
        footerNav.set([
            { id: 'export', component: ExportMenu },
        ])
    })
</script>

{#if $currentPost !== undefined}
    <article class="post" class:editing={$editing}>
        {#if $currentPost}
            <div class="post-shortcuts" use:shortcut={{ key: 'e', meta: true, onPress: () => toggleEditing() }}>
                {#if $editing}
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
