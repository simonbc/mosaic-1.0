<script>
    import { currentPost, publishPost } from "@data/posts"
    import { showPublishDialog, cmdState } from '@data/uiStore'
    import { settings } from '@data/settingsStore'

    import PublishDialog from './PublishDialog.svelte'
    import { navigateTo } from "../../routing"
    import { shortcut } from '../../actions/shortcut'

    function toggleShowDialog() {
        showPublishDialog.update((e) => !e)
    }

    let handle = '';
    let byline = '';

    $: handle = $currentPost?.post.handle || $settings.handle
    $: byline = $currentPost?.post.byline

    async function handlePublish() {
        const { post, revision } = $currentPost;
        await publishPost({ ...post, handle, byline }, revision)
        await settings.update(s => ({ ...s, handle }))
        navigateTo(post.slug, handle)
    }
</script>

<div
    class="publish-button"
    use:shortcut={{ key: 'Escape', onPress: () => toggleShowDialog() }}
    use:shortcut={{ key: 'Enter', meta: true,  onPress: () => toggleShowDialog() }}
>
    <PublishDialog
        bind:handle
        bind:byline
        onSubmit={() => handlePublish()}
        show={showPublishDialog}
    />
    {#if !$currentPost?.post.published}
        <button class="btn btn-primary" class:cmd-visible={$cmdState.cmd} on:click={() => toggleShowDialog()}>
            <span class="btn-label">
                Publish
            </span>
            {#if $cmdState.showHint}
                <span class="shortcut-hint">
                ⌘↩︎
                </span>
            {/if}            
        </button>
    {/if}
</div>

<style>
    .publish-button {
        display: flex;
        gap: 1rem;
    }
</style>