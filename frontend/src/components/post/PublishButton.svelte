<script>
    import { currentPost, publishPost } from "@data/posts.js";
    import { showPublishDialog } from '@data/uiStore.js';    

    import PublishDialog from './PublishDialog.svelte';
    import { navigateTo } from "../../routing"
    import { shortcut } from '../../actions/shortcut.js'
    import { onMount } from 'svelte';

    function toggleShowDialog() {
        showPublishDialog.update((e) => !e)
    }

    let handle = '';
    let byline = '';

    $: handle = $currentPost?.post.handle
    $: byline = $currentPost?.post.byline

    async function handlePublish() {
        const { post, revision } = $currentPost;
        publishPost({ ...post, handle, byline }, revision)
        navigateTo(post.slug, handle)
    }
</script>

<div class="publish-button" use:shortcut={{ key: 'Escape', onPress: () => toggleShowDialog() }}>
    <PublishDialog
        bind:handle
        bind:byline
        onSubmit={() => handlePublish()}
        show={showPublishDialog}
    />
    {#if !$currentPost?.post.published}
        <button class="btn btn-primary" on:click={() => toggleShowDialog()}>Publish</button>
    {/if}
</div>

<style>
    .publish-button {
        display: flex;
        gap: 1rem;
    }
</style>