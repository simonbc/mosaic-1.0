<script>
  import { createPageStore } from '../stores/page';
  import { marked } from 'marked';

  export let docId = 'default';
  const page = createPageStore(docId);
</script>

<main class="viewer-container">
  {@html marked($page.content)}
</main>

<style>
  .viewer-container {
    padding: 1rem;
  }
</style>