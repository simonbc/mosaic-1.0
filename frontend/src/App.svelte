<script>
    import { onMount, onDestroy } from 'svelte'

    import Header from './components/Header.svelte'
    import Sidebar from './components/Sidebar.svelte'
    import Home from './components/Home.svelte'
    import Page from './components/Page.svelte'
    import NotFound from './components/NotFound.svelte'

    import { currentSlug, startRouting, stopRouting } from './routing.js'
    import { loadPage } from './data/pages.js'
    import { pageData, pages, pagesLoaded } from './data/pagesStore.js'

    let slug
    let pageDataLoaded = false

    $: $currentSlug
    $: slug = $currentSlug
    $: hasPages = Object.values($pages).length > 0

    $: loadPage(slug).then(() => {
        if (slug) {
            pageDataLoaded = true
        }
    })
    
    onMount(() => {
        startRouting()
    })

    onDestroy(() => {
        stopRouting()
    })

</script>

<main >
    <Header />

    {#if hasPages}
        <Sidebar />
    {/if}

    {#if pagesLoaded}
        {#if slug }
            {#if pageDataLoaded}
                {#if $pageData}
                    <Page />
                {:else}
                    <NotFound {slug} />
                {/if}
            {/if}
        {:else}
            <Home />
        {/if}
    {/if}
</main>