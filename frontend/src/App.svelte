<script>
    import Header from './components/Header.svelte'
    import Sidebar from './components/Sidebar.svelte'
    import Editor from './components/Editor.svelte'
    import ViewPage from './components/ViewPage.svelte'
    import Revisions from './components/Revisions.svelte'

    import { editing } from './stores/ui.js'
    import { settings } from './stores/settings.js'
    import { shortcut } from './actions/shortcut.js'
    import { createRevisionsStore } from './stores/revisions.js'
    import { fade } from 'svelte/transition'

    let docId = 'default'
    let selectedRevision = null

    $: revisionsVisible = $settings.showRevisions

    const revisions = createRevisionsStore(docId)

    function changeRevision(rev) {
        selectedRevision = rev
    }

    function toggleEditing() {
        selectedRevision = null
        editing.update((e) => !e)
    }

    function toggleRevisions() {
        settings.update(s => ({ ...s, showRevisions: !s.showRevisions }))
    }
</script>

<main use:shortcut={{ key: 'h', meta: true, onPress: () => toggleRevisions() }}>
    <Header />

    <Sidebar />

    <div class="content">
        <div use:shortcut={{ key: 'e', meta: true, onPress: () => toggleEditing() }}>
            {#if $editing}
                <Editor {docId} {selectedRevision} {revisions} />
            {:else}
                <ViewPage {docId} {selectedRevision} {revisions} />
            {/if}
        </div>
    </div>
    
    {#if revisionsVisible}
    <div transition:fade>
        <Revisions {docId} {selectedRevision} {revisions} onChangeRevision={changeRevision} />
    </div>
    {/if}

</main>

<style>
</style>
