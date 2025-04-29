<script>
    import { fade } from 'svelte/transition'

    import Sidebar from './Sidebar.svelte'
    import PageEditor from './PageEditor.svelte'
    import PageViewer from './PageViewer.svelte'
    import Revisions from './Revisions.svelte'

    import { shortcut } from '../actions/shortcut.js'
    import { editing } from '../data/uiStore.js'

    $: showSidebar = !$editing

    function toggleEditing() {
        editing.update((e) => !e)
    }
</script>

<main>
    
    <Sidebar />

    <div class="content" class:with-sidebar={showSidebar}>
        <div use:shortcut={{ key: 'e', meta: true, onPress: () => toggleEditing() }}>
            {#if $editing}
                <PageEditor />
            {:else}
                <PageViewer />
            {/if}
        </div>
    </div>

    <Revisions />
</main>

<style>
    main {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .content {
        height: 100vh;
        transition: margin-left 0.3s ease;
        margin-left: 0;
    }

    .content.with-sidebar {
        margin-left: 250px;
    }
</style>