<script>
    import { onMount} from 'svelte'
    import { posts, createPost } from '@data/posts.js';
    import { navigateTo } from '../routing.js';
    import { footerNav } from '@data/uiStore.js';

    import FooterMenu from '@components/FooterMenu.svelte';

    let textareaEl
    let content
    let hasPosts

    $: hasPosts = $posts !== undefined && Object.values($posts).length > 0

     function handleInput(event) {
      content = event.target.value
    }
    
    function handleCreatePost() {
        const slug = createPost({ content })
        navigateTo(slug)
    }

    onMount(() => {
        footerNav.set([
            { id: 'footer-links', component: FooterMenu },
        ])

        if (textareaEl) {
            textareaEl.focus()
        }
    })
</script>

<section class="home">
    <h1 class="logo-home">Mosaic</h1>
    <div class="container">
        <textarea
            bind:this={textareaEl}
            bind:value={content}
            on:input={handleInput}
            placeholder="Start writing..."
            class="content-input"
            autofocus
        ></textarea>
        <button class="btn btn-primary" on:click={handleCreatePost}>
            Create a post
        </button>
    </div>
</section>
    
<style>
    .home {
        margin-top: 70px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        justify-content: center;
        align-items: center;
        padding: 2rem 1rem;
    }

    @media (min-width: 768px) {
        .home {
            min-height: calc(100vh - 140px);
        }
    }

    .container {
        text-align: center;
    }

    .content-input {
        width: 100%;
        max-width: 700px;
        height: 130px;
        resize: none;
        margin-bottom: 1rem;
        padding: 1.5rem;
        border-color: #ddd;
        border-radius: 25px;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
        background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
        font-family: var(--font-mono);
        font-size: 1rem;
    }

    .content-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--color-accent);
    }

    @media (min-width: 768px) {
        .content-input {
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
    }
</style>