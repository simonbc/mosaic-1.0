<script>
    import { onMount} from 'svelte'
    import { posts, createPost } from '@data/posts.js';
    import { navigateTo } from '../../routing.js';
    import { footerNav } from '@data/uiStore.js';

    import FooterMenu from '@components/FooterMenu.svelte';
    import DraftNotice from '@components/DraftNotice.svelte';

    import './home.css'

    let textareaEl
    let content
    let hasPosts

    $: hasPosts = $posts !== undefined && Object.values($posts).length > 0

    function handleInput(event) {
      content = event.target.value
    }
    
    function handleCreatePost() {
        const cursorPosition = textareaEl.selectionStart ?? 0
        const { slug } = createPost({ content, cursorPosition })
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
    <h1 class="logo-home"><a href="/">Mosaic</a></h1>
    <div class="container">
        <textarea
            bind:this={textareaEl}
            bind:value={content}
            on:input={handleInput}
            placeholder="Start writing..."
            class="content-input"
            tabindex="1"
        ></textarea>

        <DraftNotice />

        <div class="publish-button-wrapper">
            <button class="btn btn-primary" on:click={handleCreatePost} tabindex="2">
                Create a post
            </button>
        </div>
    </div>
</section>