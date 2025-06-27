<script>
    import { shortcut } from '../../actions/shortcut.js';
    import { settings } from '@data/settingsStore.js'
    import { currentPost, loadPost, updatePost } from '@data/posts.js';
    import { previewRevision } from '@data/uiStore.js';
    import { onMount } from 'svelte';

    function toggleShowRevisions() {
        settings.update(s => ({ ...s, showRevisions: !s.showRevisions }))
    }
  
    function handleRreviewRevision(rev) {
        if (rev.id === $currentPost.latestRevisionId) {
            previewRevision.set(null);
        } else {
            previewRevision.set(rev);
        }
        toggleShowRevisions()
    }
</script>

{#if $currentPost!== undefined && $settings.showRevisions}
    <div class="overlay" on:click={() => settings.update(s => ({ ...s, showRevisions: false }))}></div>
        <div class="revisions-wrapper">
            <div class="revisions-dropdown">
            <div class="revisions-scroll">
                <ul>
                    {#each $currentPost.revisions as rev}
                    <li>
                        <button class="unstyled" on:click|preventDefault={() => handleRreviewRevision(rev)}
                            >
                            <span>Autosaved</span>
                            <time>
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })},
                            {new Date(rev.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            </time>
                        </button>
                    </li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>
{/if}
