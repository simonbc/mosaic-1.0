<script>
    import { fade } from 'svelte/transition'

    import Sidebar from './Sidebar.svelte'
    import PageEditor from './PageEditor.svelte'
    import PageViewer from './PageViewer.svelte'
    import Revisions from './Revisions.svelte'

    import { shortcut } from '../actions/shortcut.js'
    import { editing } from '../data/uiStore.js'
    import { settings } from '../data/settingsStore.js'

    function toggleEditing() {
        editing.update((e) => !e)
    }
</script>

<main>
    
    <Sidebar />

    <div class="content">
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
        display: flex;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }

    .content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
    }
</style>