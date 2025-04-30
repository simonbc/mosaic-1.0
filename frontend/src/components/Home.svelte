<script>
  import { createPage, loadPage } from '../data/pages.js';
  import { pages } from '../data/pagesStore.js'
  import { slugify, navigateTo } from '../routing.js';
  import { editing } from '../data/uiStore.js';

  $: hasPages = Object.values($pages).length > 0

  async function handleCreatePage() {
      const title = prompt('What’s the title of your new page?');
      if (!title) return;

      const slug = slugify(title);
      createPage(title);
      await loadPage(slug);
      editing.set(true);
      navigateTo(slug);
  }
</script>
  
<main>
  {#if hasPages}
    <button on:click={handleCreatePage}>Create a new page</button>
  {:else}
    <div>What do you want create?</div>
  {/if}
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