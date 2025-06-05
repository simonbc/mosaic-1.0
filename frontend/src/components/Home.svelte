<script>
    import { onMount} from 'svelte'
    import { posts, createPost } from '@data/posts.js';
    import { navigateTo } from '../routing.js';
    import { editing } from '@data/uiStore.js';

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
        if (textareaEl) {
            textareaEl.focus()
        }
    })
</script>

<section class="home">
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
            font-size: 1.1rem;
        }
    }
</style>