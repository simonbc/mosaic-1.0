<script>
    import { onMount, onDestroy } from 'svelte'
    import { marked } from 'marked'

    import RevisionsButton from './RevisionsButton.svelte';
    import PreviewButton from './PreviewButton.svelte';
    import SaveButton from './SaveButton.svelte';

    import { navigateTo } from '../../routing.js'
    import { currentPost, updatePost, loadPost, publishPost } from '@data/posts.js'
    import { settings } from '@data/settingsStore.js'
    import { previewRevision, headerNav } from '@data/uiStore.js'
    import { shortcut } from '@actions/shortcut.js'

    import './editor.css'

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
            await updatePost($currentPost.id, { content: trimmedContent, cursorPosition });

            if ($currentPost.published) {
                publishPost($currentPost, { ...$currentPost.revision, content: trimmedContent })
                navigateTo($currentPost.slug, $currentPost.handle)
            }

            await loadPost($currentPost.handle, $currentPost.slug);
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
            $currentPost.id,
            {
                content: $previewRevision.content, // Restore old content
                cursorPosition: $previewRevision.content.length, // Set cursor to end of restored content
            }
        );

        await loadPost($currentPost.handle, $currentPost.slug);
        previewRevision.set(null);
    }

    function onSave() {
        toggleShowRevisions(false);
        savePost();
        navigateTo($currentPost.slug, $currentPost.handle);
    }

    // Only allow plain text on paste in the content editor
    function handlePaste(event) {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    }

    onMount(async () => {
        headerNav.set([
            { id: 'revisions', component: RevisionsButton, props: { toggleShowRevisions } },
            { id: 'preview', component: PreviewButton, props: { togglePreview } },
            { id: 'save', component: SaveButton, props: { onSave } },
        ]);

        if ($previewRevision) {
            cursorPosition = $previewRevision.content.length;
        } else {
            cursorPosition = $currentPost.cursorPosition ?? 0;
        }
        requestAnimationFrame(restoreCursorPosition);
    });

    onDestroy(() => {
      onSave()
    })
</script>

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
          on:paste={handlePaste}
          bind:this={contentEditable}
          bind:innerText={content}
          on:blur={saveCursorPosition}
          autofocus
          data-placeholder="Start writing..."
        ></div>
    </div>
    <div class="preview-container" class:hidden={!previewVisible}>
        <div class="content-preview" class:has-content={content.trim().length > 0}>
            {@html marked(content)}
        </div>
    </div>
</main>