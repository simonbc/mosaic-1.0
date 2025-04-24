<script>
  import { createPageStore } from '../stores/pages.js';
  import { marked } from 'marked';
  import { onMount } from 'svelte'
  import { getLatestRevision } from '../stores/revisions.js'

  export let docId = 'default';
  const page = createPageStore(docId);

  let latestContent = ''
  onMount(async () => {
    const latest = await getLatestRevision(docId)
    if (latest) {
      latestContent = latest.content
    } else {
      latestContent = ''
    }
  })
</script>

<main class="viewer-container">
  {@html marked(latestContent)}
</main>

<style>
  .viewer-container {
    padding: 1rem;
  }
</style>