<script>
    import { onMount, onDestroy } from 'svelte'

    import Header from './components/layout/Header.svelte'
    import Footer from './components/layout/Footer.svelte'
    import Home from './components/home/Home.svelte'
    import HandleViewer from './components/handle/HandleViewer.svelte'
    import Post from './components/post/Post.svelte'

    import { currentHandle, currentSlug, startRouting, stopRouting} from './routing.js'
    import { loadPost  } from '@data/posts.js'
    import { editing } from '@data/uiStore'

    $: if ($currentSlug) {
        loadPost($currentHandle, $currentSlug)
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
        {#if $currentSlug || $currentHandle}
            <Header />
        {/if}
        <div class="app-container" class:editing={$editing}>
            <div class="app-content">
                {#if $currentSlug}
                    <Post />
                {:else if $currentHandle}
                    <HandleViewer />
                {:else}
                    <Home />
                {/if}
            </div>
        </div>
        <Footer />
    </div>
{/if}