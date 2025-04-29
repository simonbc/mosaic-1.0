<script>
    import { onMount, onDestroy } from 'svelte'

    import Header from './components/Header.svelte'
    import Home from './components/Home.svelte'
    import Page from './components/Page.svelte'
    import NotFound from './components/NotFound.svelte'

    import { currentSlug, startRouting, stopRouting } from './routing.js'
    import { loadPage } from './data/pages.js'
    import { pageData, pagesLoaded } from './data/pagesStore.js'

    let slug

    $: $currentSlug
    $: slug = $currentSlug

    $:loadPage(slug)
    
    onMount(() => {
        startRouting()
    })

    onDestroy(() => {
        stopRouting()
    })

</script>

<main >
    <Header />

    {#if pagesLoaded }
        {#if slug }
            {#if $pageData}
                <Page />    
            {:else}
                <NotFound {slug} />
            {/if}
        {:else}
            <Home />
        {/if}
    {/if}
</main>