<script>
    import { posts } from '@data/posts.js'
    import { navigateTo } from '../../routing';
    import { editing } from '@data/uiStore'
</script>

{#if false && !$editing && $posts !== undefined && Object.keys($posts).length > 0}
    <aside class="sidebar">
        <ul class="post-list">
        {#each Object.values($posts) as post}
            <li><a href="#" on:click|preventDefault={() => navigateTo(post.slug)}>
            <h3>{post.title || 'Untitled post'}</h3>
            </a></li>
        {/each}
        </ul>
    </aside>
{/if}

<style>
    .sidebar {
        order: 1;
        min-width: 350px;
        border-left: 1px solid var(--color-border); 
        /* margin: 2rem 0; */
    }

    .post-list {
        list-style: none;
        padding: 0;
        margin: 2rem;
        width: 100%;
    
    }

    .post-list li {
        background: #fff;
        padding: 1rem 1.25rem;
        margin: 0;
        
    }

    .post-list li:hover {
        background: #f9f9f9;
        box-shadow: var(--shadow);
    }

    .post-list a {
        text-decoration: none;
        color: var(--color-text);
        display: block;
    }

    .post-list h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        line-height: 1.4;
    }
</style>