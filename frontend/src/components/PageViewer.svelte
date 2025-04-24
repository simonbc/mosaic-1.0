<script>
  import { createPageStore } from '../stores/page';
  import { marked } from 'marked';

  export let docId = 'default';
  const contentStore = createPageStore(docId);
</script>

<main class="viewer-container">
  {@html marked($contentStore)}
</main>

<style>
  .viewer-container {
    padding: 1rem;
  }
</style>