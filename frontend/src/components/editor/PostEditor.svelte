<script>
    import { onMount, onDestroy } from 'svelte'
    import { marked } from 'marked'

    import RevisionsButton from './RevisionsButton.svelte';
    import PreviewButton from './PreviewButton.svelte';
    import SaveButton from './SaveButton.svelte';

    import { navigateTo, currentHandle, currentSlug } from '../../routing.js'
    import { currentPost, createPost, updatePost, loadPost, fetchPublicPost, publishPost } from '@data/posts.js'
    import { settings } from '@data/settingsStore.js'
    import { previewRevision, editing, responding, headerNav } from '@data/uiStore.js'
    import { shortcut } from '@actions/shortcut.js'

    const MIN_CONTENT_TEXTAREA_HEIGHT = 130

    let contentTextarea;
    let content;
    let cursorPosition = null

    $: content = $previewRevision ? $previewRevision?.content : $currentPost?.revision.content;

    $: previewVisible = $settings.showPreview

    // Ensure textarea resizes when content is updated programmatically
    $: if (content !== undefined) {
        requestAnimationFrame(resizeContent);
    }


    // For auto-expanding textarea
    function resizeContent() {
        console.log('Resizing content textarea')
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

            if ($responding) {
                responding.set(false)
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
                cursorPosition: $previewRevision.content.length, // Set cursor to end of restored content
            }
        );

        await loadPost($currentPost.post.slug);
        previewRevision.set(null);
    }

    function onSave() {
        toggleShowRevisions(false);
        saveCursorPosition()
        savePost()
        navigateTo($currentPost.post.slug, $currentPost.post.handle)
    }

    onMount(async () => {
        headerNav.set([
            { id: 'revisions', component: RevisionsButton, props: { toggleShowRevisions } },
            { id: 'preview', component: PreviewButton, props: { togglePreview } },
            { id: 'save', component: SaveButton, props: { onSave } },
        ]);
        if ($responding && $currentSlug) {
            const post = await fetchPublicPost($currentHandle, $currentSlug)
            const newSlug = await createPost({ parentId: post.id });
            await loadPost(newSlug)
            editing.set(true)
            responding.set(false)
        }

        if ($previewRevision) {
            cursorPosition = $previewRevision.content.length;
        } else {
            cursorPosition = $currentPost.cursorPosition ?? 0
        }
        
        resizeContent();

        if (contentTextarea) {
            const pos = $currentPost.post.cursorPosition || $currentPost.revision.content.length;
            requestAnimationFrame(() => {
                contentTextarea.setSelectionRange(pos, pos);
                scrollTextareaToCaret(contentTextarea);
            });
        }
    });

    onDestroy(() => {
      onSave()
    })
</script>

{#if !$responding}
<main
  class="split-container"
  use:shortcut={{ key: 'p', meta: true, onPress: togglePreview }}
  use:shortcut={{ key: 'r', meta: true, onPress: () => toggleShowRevisions() }}
>
    {#if $previewRevision}
        <div class="revision-banner">
        <div>Viewing revision from 

        {new Date($previewRevision.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })}</div>
        <div>
        <button class="btn-link" on:click={() => previewRevision.set(null)}>Cancel</button>
        &middot;
        <button class="btn-link" on:click={() => confirmRestore()}>Restore this revision</button>
        </div>
        </div>
    {/if}
    
    <div class="editor-container" class:full={!previewVisible}>
        <textarea
        bind:this={contentTextarea}
        bind:value={content}
        placeholder={$currentPost.post.parentId ? "Write your response..." : "Start writing..."}
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
{/if}
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
        width: 100%;
        min-height: 130px;
        resize: none;
        padding: 1.5rem;
        border-color: #ddd;
        border-radius: 25px;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
        font-family: var(--font-mono);
        font-size: 1rem;
        line-height: 1.9;
    }

    .content-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--color-accent);
    }

    @media (min-width: 768px) {
        .content-input {
            font-size: 1.1rem;
            min-width: calc(50vw - 90px);
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
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        background-color: var(--color-bg);
        z-index: 11;
        border: 1px solid #ddd;
        padding: 0.75rem 1.5rem;
        text-align: center;
        font-size: 0.95rem;
    }

    @media(min-width: 768px) {
        .revision-banner {
            top: 6.5rem;
            bottom: unset;
            display: flex;
            width: unset;
            border-radius: 25px;
        }
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