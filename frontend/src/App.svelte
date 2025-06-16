<script>
    import { onMount, onDestroy } from 'svelte'

    import Header from './components/layout/Header.svelte'
    import Footer from './components/layout/Footer.svelte'
    import Home from './components/Home.svelte'
    import Post from './components/post/Post.svelte'

    import { currentSlug, startRouting, stopRouting} from './routing.js'
    import { loadPost  } from '@data/posts.js'
    import { editing } from '@data/uiStore'

    $: if ($currentSlug) {
        loadPost($currentSlug)
    }

    onMount(() => {
        startRouting()
    })

    onDestroy(() => {
        stopRouting()
    })
</script>

{#if $currentSlug !== undefined}
    <div class="app-main" role="main">
        {#if $currentSlug}
            <Header />
        {/if}
        <div class="app-container" class:editing={$editing}>
            <div class="app-content">
                {#if $currentSlug}
                    <Post />
                {:else}
                    <Home />
                {/if}
            </div>
        </div>
        <Footer />
    </div>
{/if}