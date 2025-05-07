<script>
  import { createPageFromTitle, loadPage } from '../data/pages.js';
  import { pages } from '../data/pagesStore.js'
  import { slugify, navigateTo } from '../routing.js';
  import { editing } from '../data/uiStore.js';

  $: hasPages = Object.values($pages).length > 0

  async function handleCreatePage() {
    let title
    if (hasPages) {
      title = prompt('What’s the title of your new page?');
      if (!title) return;
    } else {
      title = 'Welcome'
    }

    const slug = slugify(title);
    createPageFromTitle(title);
    await loadPage(slug);
    editing.set(true);
    navigateTo(slug);
  }
</script>
  
<main>
  <button on:click={handleCreatePage}>
    {#if hasPages}
      Create a new page
    {:else}
      Create your first page
    {/if}
  </button>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background: #fafafa;
    color: #333;
    padding: 2rem;
  }
</style>