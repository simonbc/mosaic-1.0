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

    let contentEditable;
    let content;
    let cursorPosition = null

    $: content = $previewRevision ? $previewRevision?.content : $currentPost?.revision.content;

    $: previewVisible = $settings.showPreview

    async function togglePreview() {
        await settings.update(s => ({ ...s, showPreview: !s.showPreview }))
    }

    function toggleShowRevisions(value = null) {
        const newValue = value !== null ? value : !$settings.showRevisions
        settings.update(s => ({ ...s, showRevisions: newValue }))
    }

    async function savePost() {
        const normalizedContent = content
          .split('\n')
          .filter((line, idx, arr) => {
            if (line.trim() !== '') return true;
            return arr[idx - 1]?.trim() !== '';
          })
          .join('\n');

        const trimmedContent = normalizedContent.replace(/\n+$/, '');
        if (trimmedContent !== $currentPost.revision.content) {
            await updatePost($currentPost.post.slug, { content: trimmedContent, cursorPosition });

            const { post, revision } = $currentPost
            if ($currentPost.post.published) {
                publishPost(post, { ...revision, content: trimmedContent })
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
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(contentEditable);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorPosition = preCaretRange.toString().length;
    }

    function restoreCursorPosition() {
      if (!contentEditable || cursorPosition === null) return;

      let offset = cursorPosition;
      const walker = document.createTreeWalker(
        contentEditable,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node = null;
      while ((node = walker.nextNode())) {
        if (node.length >= offset) {
          const range = document.createRange();
          const selection = window.getSelection();

          range.setStart(node, offset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          // --- Ensure caret is scrolled into view after positioning ---
          const caretRect = range.getBoundingClientRect();
          const buffer = 100;
          const visibleBottom = window.innerHeight;

          if (caretRect.bottom > visibleBottom - buffer) {
            window.scrollBy({
              top: caretRect.bottom - (visibleBottom - buffer),
              behavior: 'smooth'
            });
          }
          // -----------------------------------------------------------
          return;
        } else {
          offset -= node.length;
        }
      }
    }

    function nudgeIfNearBottom() {
        const caretRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        const buffer = 100;
        const visibleBottom = window.innerHeight;

        if (caretRect.bottom > visibleBottom - buffer) {
            window.scrollBy({
            top: caretRect.bottom - (visibleBottom - buffer),
            behavior: 'smooth'
            });
        }
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
            cursorPosition = $currentPost.post.cursorPosition ?? 0
        }
        requestAnimationFrame(restoreCursorPosition);
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
        <div
          class="content-editor"
          contenteditable="true"
          on:input={() => nudgeIfNearBottom()}
          bind:this={contentEditable}
          bind:innerText={content}
          on:blur={saveCursorPosition}
          autofocus
        ></div>
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
        display: none;
    }

    .content-editor {
      width: 100%;
      max-width: calc(60ch + 4rem);
      margin: 0 auto;
      min-height: 130px;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 25px;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
      font-family: var(--font-mono);
      font-size: 1rem;
      line-height: 1.9;
      white-space: pre-wrap;
      word-break: break-word;
      outline: none;
    }

    .content-editor:focus {
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