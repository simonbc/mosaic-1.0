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
        if (rev.id === $currentPost.post.latestRevisionId) {
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

<style>
    .revisions-wrapper {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 8px;
      z-index: 100;
    }

    .revisions-wrapper::before {
        content: "";
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 7px solid #ddd; /* border color */
        z-index: 1;
    }

    .revisions-wrapper::after {
        content: "";
        position: absolute;
        top: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid white; /* dropdown background */
        z-index: 2;
    }

    .revisions-dropdown {
        background: white;
        border: 1px solid #ddd;
        border-radius: 25px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 1rem 0.5rem;
        width: 280px;
    }

    .revisions-scroll {
        padding: 0 0.5rem;
        max-height: 400px;
        overflow-y: auto;
    }

    .revisions-dropdown ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .revisions-dropdown li {
        padding: 0.8rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
    }

    .revisions-dropdown li:last-child {
        border: 0;
    }

    .revisions-dropdown li:hover {
        background-color: #f9f9f9;
    }

    .revisions-dropdown li time {
        color: #888;
        font-size: 0.85rem;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        z-index: 10;
    }
</style>