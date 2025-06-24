<script>
    import { onMount } from 'svelte';
    import { currentHandle } from '../routing.js';
    import { apiFetch } from '@utils/fetch.js';
    import { API_BASE } from '../env.js'
    import { marked } from 'marked';

    import PostMeta from './post/PostMeta.svelte'

    let posts = undefined;

    onMount(async () => {
        const res = await apiFetch(`/api/handle/${$currentHandle}/posts`);
        posts = res.posts
    });
</script>

<div class="handle-container">
    <section class="handle-header">
        <h1>@{$currentHandle}</h1>
    </section>
{#if posts !== undefined}
    {#if posts.length === 0}
        <p>No posts yet.</p>
    {:else}
        <ul class="handle-posts">
            {#each posts as post}
                <li class="handle-post">
                    <a class="handle-post-link" href="/@{post.handle}/{post.slug}">
                        <div class="post-section">
                            <div class="post-content">
                            {#if post.latest_revision.content}
                                {@html (() => {
                                    const content = post.latest_revision.content.trim();
                                    const lines = content.split('\n').filter(Boolean).slice(0, 3);
                                    const hasMore = content.split('\n').filter(Boolean).length > 3;
                                    const preview = lines.join('\n');
                                    return marked(preview + (hasMore ? '\n\n...' : ''));
                                })()}
                            {:else}
                                {post.slug}
                            {/if}
                        </div>
                        </div>
                        <PostMeta post={{updatedAt: post.updated_at }} />
                    </a>
                </li>
            {/each}
        </ul>
    {/if}
{/if}
</div>

<style>
    .handle-header {
        margin: 0;
        font-family: var(--font-mono);
    }

    @media (min-width: 768px) {
        .handle-header {
            margin: 3rem 0 1rem;
        }
    }

    .handle-header h1 {
        font-size: 2rem;
    }

    .handle-posts {
        list-style: none;
        margin-top: 2rem;
        padding: 0;
    }

    .handle-post {
        margin-bottom: 3rem;
        text-align: left;
        padding-bottom: 2rem;
        border-bottom: solid var(--color-border);
    }

    .handle-post:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .handle-post-link {
        text-decoration: none;
        color: inherit;
        display: block;
    }

    .post-section {
        align-items: flex-start;
    }

    .post-content {
        font-size: 1.125rem;
    }

    .handle-post .post-content :global(h1) {
        font-size: 1.4rem;
        margin-bottom: 0.5rem;
    }

    .handle-post .post-content :global(h2) {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
    }

    .handle-post-link:hover {
      background-color: #f9f9f9;
      transition: background 0.2s ease;
    }
</style>