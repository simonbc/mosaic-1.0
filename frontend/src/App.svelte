<script>
    import Header from './components/Header.svelte'
    import Sidebar from './components/Sidebar.svelte'
    import Editor from './components/Editor.svelte'
    import PageViewer from './components/PageViewer.svelte'
    import Revisions from './components/Revisions.svelte'

    import { editing } from './stores/editor.js'
    import { shortcut } from './actions/shortcut.js'
</script>

<main>
    <Header />

    <Sidebar />

    <div class="content">

        <div use:shortcut={{ key: 'e', meta: true, onPress: () => editing.update(v => !v) }}>
            {#if $editing}
              <Editor />
            {:else}
              <PageViewer />
            {/if}
        </div>
    </div>

    <Revisions />

</main>

<style>
</style>
