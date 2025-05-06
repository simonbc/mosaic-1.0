<script>
  import { marked } from 'marked'

  import PublishDialog from './PublishDialog.svelte';
  import { pageData } from '../data/pagesStore.js'
  import { previewRevision, showPublishDialog } from '../data/uiStore.js'
  import { publishPage, loadPage } from '../data/pages.js';
  import {
  getOrCreateKeyPair,
  signHandle,
  exportPublicKeyHex
} from '../utils/crypto.js'

  let handle = '';
  let byline = '';
  let license = 'CC-BY';

  $: handle = $pageData.page.handle
  $: byline = $pageData.page.byline

  export async function handlePublish() {
    const { page, revision } = $pageData;

    const { privateKeyJwk, publicKeyJwk } = await getOrCreateKeyPair();

    const publicHex = await exportPublicKeyHex(publicKeyJwk);
    console.log('Using public key:', publicHex);

    const signature = await signHandle(handle, privateKeyJwk);
    console.log('Generated signature:', signature);

    const payload = {
      handle,
      slug: page.slug,
      title: page.title,
      content: revision.content,
      created_at: page.createdAt,
      updated_at: Date.now(),
      byline,
      license,
      signature,
      public_key: publicHex
    };

    const res = await fetch(`http://localhost:8000/api/page/${handle}/${page.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert('Failed to publish page');
      return;
    }

    publishPage(page.id, revision.id, handle, byline, license);
    await loadPage($pageData.page.slug);
  }

  function toggleShowDialog() {
    showPublishDialog.update((show) => !show);
  }
</script>

<main>
  {#if $pageData}
    <div class="header">
      <h1 class="page-title">{$pageData.page.title}</h1>
      {#if !$previewRevision}
        <button class="publish-button" on:click={() => toggleShowDialog()}>Publish</button>
      {/if}
    </div>
    <PublishDialog
      bind:handle
      bind:byline
      bind:license
      onSubmit={() => handlePublish()}
      show={showPublishDialog}
    />
    <article class="content">
        {@html marked.parse(
            $previewRevision 
                ? $previewRevision.content
                : $pageData.revision.content
      )}
      {#if $pageData?.revision?.published}
      <p class="published-link">
        Published at:
        <a href={`http://localhost:8000/${$pageData.page.handle}/${$pageData.page.slug}`}
           target="_blank" rel="noopener">
          mosaic.pub/{$pageData.page.handle}/{$pageData.page.slug}
        </a>
      </p>
    {/if}
    </article>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 2rem;
    background: #fefefe;
    color: #222;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    margin-top: 0;
    font-size: 2rem;
  }

  article.content {
    flex: 1;
    width: 100%;
    font-family: serif;
    font-size: 1.1rem;
    line-height: 1.5;
    overflow-y: auto;
  }

  .publish-button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .publish-button:hover {
    background: #f3f3f3;
  }

  .publish-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .published-link {
    font-size: 0.9em;
    margin-top: 2rem;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background-color: #f9f9f9;
    border-left: 4px solid #ccc;
    border-radius: 4px;
  }

  .published-link a {
    text-decoration: underline;
    color: #333;
    font-weight: 500;
  }
</style>