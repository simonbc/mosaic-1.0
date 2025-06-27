<script>
    import { onMount } from 'svelte';
    import { currentHandle } from '../../routing.js';
    import { apiFetch } from '@utils/fetch.js';
    import { marked } from 'marked';

    import PostMeta from '../post/PostMeta.svelte'
    import './handle.css';
    import '../post/post.css';

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