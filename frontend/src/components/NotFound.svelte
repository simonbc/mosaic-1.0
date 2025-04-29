<script>
    import { createPage } from '../data/pages.js';
    import { loadPage } from '../data/pages.js';
    import { editing } from '../data/uiStore.js';
    import { deslugify } from '../routing.js';
  
    export let slug;
  
    async function createNewPage() {
      const title = deslugify(slug);
      const pageId = createPage(title);
      await loadPage(slug);
      editing.set(true);
    }
  </script>
  
  <main class="not-found">
    <h1>Page not found</h1>
    <p>The page <code>{slug}</code> does not exist.</p>
    <button on:click={createNewPage}>Create this page</button>
  </main>
  
  <style>
    main.not-found {
      text-align: center;
      margin-top: 10vh;
      padding: 2rem;
    }
  
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
  
    p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
  
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>