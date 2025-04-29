<script>
    import { pageData } from '../data/pagesStore.js'
    import { shortcut } from '../actions/shortcut.js';
    import { settings } from '../data/settingsStore.js'
    import { loadPage, updatePage } from '../data/pages.js';
    import { previewRevision } from '../data/uiStore.js';
    import { deleteDraft } from '../data/draftsStore.js';

    let showToast = false;
    let showConfirmRestore = false;

    function toggleShowRevisions() {
        settings.update(s => ({ ...s, showRevisions: !s.showRevisions }))
    }
  
    function handleRreviewRevision(rev) {
        previewRevision.set(rev)
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
        showConfirmRestore = false;

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
                <h2>Version history</h2>
                <ul>
                {#each $pageData.revisions as rev}
                    <li>
                    <button on:click={() => handleRreviewRevision(rev)}>
                        {new Date(rev.createdAt).toLocaleString()}
                    </button>
                    </li>
                {/each}
                </ul>
                {#if $previewRevision}
                    {#if showConfirmRestore}
                        <div class="confirm-restore">
                            <p>Are you sure you want to restore this revision?</p>
                            <button on:click={confirmRestore}>Yes, Restore</button>
                            <button on:click={() => showConfirmRestore = false}>Cancel</button>
                        </div>
                    {:else}
                        <button class="restore-button" on:click={() => showConfirmRestore = true}>
                            Restore this Revision
                        </button>
                    {/if}
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
    width: 300px; /* <-- fixed width sidebar */
    background: #f9f9f9;
    border-left: 1px solid #ddd;
    height: 100vh;
    overflow-y: auto;
    padding: 1rem;
    box-sizing: border-box;
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
    margin-bottom: 0.5rem;
}

button {
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    padding: 0.5rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.2s;
}

button:hover {
    background: #eee;
}

.confirm-restore {
    background: #fff8dc;
    padding: 1rem;
    border: 1px solid #ccc;
    margin-top: 1rem;
    border-radius: 6px;
  }

  .confirm-restore p {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  .confirm-restore button {
    margin-right: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
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
</style>