<script>
    import Header from './components/Header.svelte'
    import Sidebar from './components/Sidebar.svelte'
    import Editor from './components/Editor.svelte'
    import ViewPage from './components/ViewPage.svelte'
    import Revisions from './components/Revisions.svelte'

    import { editing } from './stores/editor.js'
    import { shortcut } from './actions/shortcut.js'
    import { createRevisionsStore } from './stores/revisions.js'

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
</script>

<main>
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

    <Revisions {docId} {revisions} onChangeRevision={changeRevision} />

</main>

<style>
</style>
