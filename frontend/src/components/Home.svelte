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
  <nav class="top-menu">
    <a href="/about">about</a>
    <a href="mailto:hello@mosaic.pub">talk to us</a>
  </nav>
  <div class="logo">Mosaic</div>
  <div class="home-content">
    
    
    
    <button on:click={handleCreatePage}>
      {#if hasPages}
        Create a new page
      {:else}
        Publish your first page
      {/if}
    </button>
    
  </div>
</main>

<style>
main {
  position: relative;
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

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #666;
  font-family: sans-serif;
}

.top-menu {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 1.2rem;
  font-family: sans-serif;
}

.top-menu a {
  font-size: 0.9rem;
  color: #666;
  text-decoration: none;
}

.top-menu a:hover {
  text-decoration: underline;
}

.home-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.tagline {
  font-size: 1.8rem;
  font-weight: 500;
  color: #444;
  margin-bottom: 1.2rem;
  max-width: 40ch;
  line-height: 1.6;
}

.subtagline {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.8rem;
  max-width: 42ch;
  line-height: 1.6;
}

button {
  font-size: 1rem;
  padding: 0.55rem 1.4rem;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  background: #333;
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.note {
  margin-top: 2rem;
  font-size: 1rem;
  color: #888;
  line-height: 1.6;
}
</style>  