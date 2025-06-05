<script>
    import { onMount, onDestroy } from 'svelte'
    import { marked } from 'marked'

    import RevisionsButton from './RevisionsButton.svelte';
    import PreviewButton from './PreviewButton.svelte';
    import SaveButton from './SaveButton.svelte';

    import { navigateTo } from '../../routing.js'
    import { currentPost, createPost, updatePost, loadPost, fetchPost, publishPost } from '@data/posts.js'
    import { settings } from '@data/settingsStore.js'
    import { previewRevision, editing, responding, headerButtons } from '@data/uiStore.js'
    import { shortcut } from '@actions/shortcut.js'

    const MIN_CONTENT_TEXTAREA_HEIGHT = 130

    let contentTextarea;
    let content;
    let cursorPosition = null

    $: content = $previewRevision ? $previewRevision?.content : $currentPost?.revision.content;

    $: previewVisible = $settings.showPreview

    $: if (contentTextarea && $currentPost.post.cursorPosition != null) {
        contentTextarea.setSelectionRange($currentPost.post.cursorPosition, $currentPost.post.cursorPosition)
        scrollTextareaToCaret(contentTextarea)
    }

    // For auto-expanding textarea
    function resizeContent() {
        if (contentTextarea) {
            contentTextarea.style.height = 'auto';
            const height = Math.max(contentTextarea.scrollHeight + 20, MIN_CONTENT_TEXTAREA_HEIGHT)
            contentTextarea.style.height = height + 'px';
        }
    }

    function scrollTextareaToCaret(el) {
        if (!el) return
        const { selectionStart } = el
        // Scroll so caret is visible
        const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 16
        const paddingTop = parseInt(getComputedStyle(el).paddingTop) || 0
        const scrollPos = lineHeight * (el.value.substr(0, selectionStart).split('\n').length - 1)
        el.scrollTop = scrollPos - paddingTop
    }

    async function togglePreview() {
        await settings.update(s => ({ ...s, showPreview: !s.showPreview }))
        resizeContent();
    }

    function toggleShowRevisions(value = null) {
        const newValue = value !== null ? value : !$settings.showRevisions
        settings.update(s => ({ ...s, showRevisions: newValue }))
    }

    async function savePost() {
        if (content.trim() !== $currentPost.revision.content) {
            await updatePost($currentPost.post.slug, { content, cursorPosition });

            const { post, revision } = $currentPost
            if ($currentPost.post.published) {
                publishPost(post, { ...revision, content })
                navigateTo(post.slug, post.handle)
            }

            await loadPost(post.slug);
            previewRevision.set(null)
        }
    }

    function saveCursorPosition() {
        cursorPosition = contentTextarea?.selectionStart || 0
    }

    async function confirmRestore() {
        if (!$previewRevision || !$currentPost) return;

        await updatePost(
            $currentPost.post.slug, 
            {
                content: $previewRevision.content, // Restore old content
                cursorPosition: 0
            }
        );

        await loadPost($currentPost.post.slug);
        previewRevision.set(null);
    }

    function onSave() {
        toggleShowRevisions(false);
        saveCursorPosition()
        savePost()
    }

    onMount(async () => {
        headerButtons.set([
            { id: 'revisions', component: RevisionsButton, props: { toggleShowRevisions } },
            { id: 'preview', component: PreviewButton, props: { togglePreview } },
            { id: 'save', component: SaveButton, props: { onSave } },
        ]);

        if ($responding && $currentPost.post.id) {
            const post = await fetchPost($currentPost.post.id)
            const newSlug = await createPost({ parentId: post.id });
            await loadPost(newSlug)
            responding.set(false)
            editing.set(true)
            navigateTo(newSlug)
        }

        if ($previewRevision) {
            cursorPosition = 0;
        } else {
            cursorPosition = $currentPost.cursorPosition ?? 0
        }
        
        resizeContent();
    });

    onDestroy(() => {
      onSave()
    })
</script>

<main
  class="split-container" use:shortcut={{ key: 'p', meta: true, onPress: togglePreview }}
>
    {#if $previewRevision}
        <div class="revision-banner">
        Viewing revision from 

        {new Date($previewRevision.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })}
        &middot;
        <button class="btn-link" on:click={() => previewRevision.set(null)}>Cancel</button>
        &middot;
        <button class="btn-link" on:click={() => confirmRestore()}>Restore this revision</button>
        </div>
    {/if}
    
    <div class="editor-container" class:full={!previewVisible}>
        <textarea
        bind:this={contentTextarea}
        bind:value={content}
        placeholder="Start writing..."
        class="content-input"
        autofocus
        ></textarea>
    </div>
    <div class="preview-container" class:hidden={!previewVisible}>
        <div class="content-preview" class:has-content={content.trim().length > 0}>
            {@html marked(content)}
        </div>
    </div>
</main>

<style>
    .split-container {
        padding: 1rem 0;    
        color: #222;
        position: relative;
        display: flex;
        justify-content: center;
        gap: 60px;
        width: 100%;
        overflow: visible;
    }

    @media (min-width: 768px) {
        .split-container {
            padding: 2rem 5rem;
        }
    }

    .editor-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    @media (min-width: 768px) {
        .editor-container {
            width: 50%;
        }
    }

    .editor-container.full {
        width: 100%;
    }

    .preview-container {
        display: none;
        width: 50%;
    }

    @media (min-width: 768px) {
        .preview-container {
            display: block;
        }
    }

    .preview-container.hidden {
        width: 0;
        opacity: 0;
        pointer-events: none;
        transform: translateY(1rem);
    }

    .preview-container:not(:has(.content-preview.has-content)) {
        display: none;
    }

    .content-input {
        padding: 1.5rem;
        border: none;
        overflow: hidden;
        outline: none;
        resize: none;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        line-height: 1.9;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
        border-color: #ddd;
        border-radius: 25px;
        resize: none;
        min-width: calc(50vw - 90px);
        min-height: 130px;
    }

    @media (min-width: 768px) {
        .content-input {
            font-size: 1.1rem;
            max-width: 768px;
        }
    }

    .content-preview {
        font-family: var(--font-post-content);
        font-size: var(--font-post-content-size);
        font-weight: var(--font-post-content-weight);
        letter-spacing: var(--font-post-content-letter-spacing);
        line-height: var(--font-post-content-line-height);
    }

    .content-preview.has-content {
        min-height: 130px;
        min-width: calc(50vw - 90px);
    }

    .content-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--color-accent);
    }

    /* Buttons */
    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background: none;
        border: 1px solid #ccc;
        border-radius: var(--radius);
        cursor: pointer;
        color: var(--color-text);
        transition: background var(--transition);
    }

    button:hover {
        background: #eee;
    }

    .revision-banner {
        position: fixed;
        top: 6.5rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-bg);
        z-index: 11;
        border: 1px solid #ddd;
        padding: 0.75rem 1.5rem;
        text-align: center;
        font-size: 0.95rem;
        border-radius: 25px;
    }

    .revision-banner .btn-link {
        all: unset;
        cursor: pointer;
        color: var(--color-accent);
        text-underline-offset: 2px;
        margin: 0 0.25rem;
    }

    .revision-banner .btn-link:hover {
        text-decoration-thickness: 2px;
        color: #3c3c3c;
    }
</style>