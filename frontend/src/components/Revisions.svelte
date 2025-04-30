<script>
    import { pageData } from '../data/pagesStore.js'
    import { shortcut } from '../actions/shortcut.js';
    import { settings } from '../data/settingsStore.js'
    import { loadPage, updatePage } from '../data/pages.js';
    import { previewRevision } from '../data/uiStore.js';
    import { deleteDraft } from '../data/draftsStore.js';

    let showToast = false;

    function toggleShowRevisions() {
        settings.update(s => ({ ...s, showRevisions: !s.showRevisions }))
    }
  
function handleRreviewRevision(rev) {
    if (rev.id === $pageData.page.latestRevisionId) {
        previewRevision.set(null);
    } else {
        previewRevision.set(rev);
    }
}

    async function confirmRestore() {
        if (!$previewRevision || !$pageData) return;

        await updatePage(
            $pageData.page.id, 
            {
                title: $pageData.page.title, // Keep current title
                content: $previewRevision.content, // Restore old content
                cursorPosition: 0
            }
        );

        await loadPage($pageData.page.slug);
        deleteDraft($pageData.page.id);
        previewRevision.set(null);

        showToast = true;
        setTimeout(() => {
            showToast = false;
        }, 3000);
    }
</script>

<aside use:shortcut={{ key: 'h', meta: true, onPress: () => toggleShowRevisions() }}>
    {#if $settings.showRevisions }
        {#if $pageData.revisions.length > 0}
            <section class="revisions">
                <div class="revisions-content">
                    <h2>Version history</h2>
                    <ul>
                    {#each $pageData.revisions as rev}
                        <li>
                        <a
                          href="#"
                          class:selected={$previewRevision?.id === rev.id}
                          on:click|preventDefault={() => handleRreviewRevision(rev)}
                        >
                            <span>
                              {new Date(rev.createdAt).toLocaleString()}
                              {#if rev.published}
                                <span class="published-icon" title="Published"></span>
                              {/if}
                            </span>
                        </a>
                        </li>
                    {/each}
                    </ul>
                </div>
                {#if $previewRevision}
                <div class="revisions-footer">
                        <button on:click={() => confirmRestore()}>
                            Restore revision
                        </button>
                    </div>
                    {/if}
            </section>
        {:else}
            <p>No revisions yet.</p>
        {/if}
        {#if showToast}
            <div class="toast">
                Restored successfully!
            </div>
        {/if}
    {/if}
</aside>

<style>
    .revisions {
        display: flex;
        flex-direction: column;
        width: 250px;
        background: #f9f9f9;
        border-left: 1px solid #ddd;
        height: 100vh;
        box-sizing: border-box;
    }

    .revisions-content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
    }

    .revisions-footer {
        padding: 1rem;
        border-top: 1px solid #ddd;
        background: #f9f9f9;
    }

    h2 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        margin-bottom: 0;
    }

    button {
        padding: 0.5rem;
        font-size: 0.8rem;
        width: 100%;
    }

    .toast {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: #333;
        color: #fff;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        opacity: 0.95;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: fadeInOut 3s forwards;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(20px); }
        10% { opacity: 0.95; transform: translateY(0); }
        90% { opacity: 0.95; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(20px); }
    }

    .published-icon {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #4caf50;
        border-radius: 50%;
        margin-left: 0.5rem;
        vertical-align: middle;
    }

    a {
    display: block;
    text-decoration: none;
    color: inherit;
    padding: 0.5rem;
    font-size: 0.8rem;
    transition: background 0.2s;
    }

    a:hover {
    background: #eee;
    }

    a.selected {
      background: #eee;
      font-weight: bold;
    }
</style>
