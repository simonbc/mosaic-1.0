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

    $: handle = $currentPost?.handle || $settings.handle
    $: byline = $currentPost?.byline || $settings.byline

    async function handlePublish() {
        await publishPost({ ...$currentPost, handle, byline }, $currentPost.revision)
        await settings.update(s => ({ ...s, handle, byline }))
        navigateTo($currentPost.slug, handle)
    }
</script>

<div
    class="publish-button"
    use:shortcut={[
        { key: 'Escape', onPress: () => { if (!$currentPost?.published && $showPublishDialog) toggleShowDialog()}},
        { key: 'Enter', meta: true,  onPress: () => { if (!$currentPost?.published && !$showPublishDialog) toggleShowDialog() }}
    ]}
>
    {#if $showPublishDialog}
        <PublishDialog
            bind:handle
            bind:byline
            onSubmit={() => handlePublish()}
            show={showPublishDialog}
        />
    {/if}
    {#if !$currentPost?.published}
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
