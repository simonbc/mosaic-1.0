<script>
    import Header from './components/Header.svelte'
    import Sidebar from './components/Sidebar.svelte'
    import Editor from './components/Editor.svelte'
    import ViewPage from './components/ViewPage.svelte'
    import Revisions from './components/Revisions.svelte'

    import { editing, showRevisions } from './stores/ui.js'
    import { shortcut } from './actions/shortcut.js'
    import { createRevisionsStore } from './stores/revisions.js'
    import { fade } from 'svelte/transition'

    let docId = 'default'
    let currentRevision = null

    const revisions = createRevisionsStore(docId)

    function changeRevision(rev) {
        currentRevision = rev
    }

    function toggleEditing() {
        currentRevision = null
        editing.update((e) => !e)
    }

    function toggleRevisions() {
        showRevisions.update((s) => !s)
    }
</script>

<main use:shortcut={{ key: 'h', meta: true, onPress: () => toggleRevisions() }}>
    <Header />

    <Sidebar />

    <div class="content">
        <div use:shortcut={{ key: 'e', meta: true, onPress: () => toggleEditing() }}>
            {#if $editing}
                <Editor {docId} {currentRevision} {revisions} />
            {:else}
                <ViewPage {docId} {currentRevision} {revisions} />
            {/if}
        </div>
    </div>
    
    {#if $showRevisions}
    <div transition:fade>
        <Revisions {docId} {currentRevision} {revisions} onChangeRevision={changeRevision} />
    </div>
    {/if}

</main>

<style>
</style>
