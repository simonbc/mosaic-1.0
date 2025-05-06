<script>
    import { fly } from 'svelte/transition';
    import { get } from 'svelte/store';

    import { pages } from '../data/pagesStore.js';
    import { currentSlug, navigateTo, slugify } from '../routing.js';
    import { loadPage, createPageFromTitle, deletePage} from '../data/pages.js';
    import { editing } from '../data/uiStore.js';
  
    let allPages = [];
  
    $: allPages = Object.values($pages).sort((a, b) => a.title.localeCompare(b.title));
  
    function gotoPage(slug) {
      navigateTo(slug);
    }
    
    async function handleCreatePage() {
        const title = prompt('Title for new page:');
        if (!title) return;

        const slug = slugify(title);
        createPageFromTitle(title);
        await loadPage(slug);
        editing.set(true);
        navigateTo(slug);
    }

    function handleDeletePage(pageId) {
      const page = get(pages)[pageId];
      if (!page) return;

      const confirmed = confirm(`Delete page "${page.title}"?`);
      if (!confirmed) return;

      deletePage(pageId);

      if (page.slug === $currentSlug) {
        navigateTo('');
      }
    }
  </script>
  
  {#if !$editing}
    <aside class="sidebar" transition:fly="{{ x: -250, duration: 300 }}">
      <ul>
        {#each allPages as page}
        <li class:active={page.slug === $currentSlug}>
          <div class="page-entry">
            <a href="/{page.slug}" on:click|preventDefault={() => gotoPage(page.slug)}>
              {page.title}
              {#if page.published}
                <span class="published-icon" title="Published"></span>
              {/if}
            </a>
            <button class="delete-button" on:click={() => handleDeletePage(page.id)}>✕</button>
          </div>
        </li>
        {/each}
      </ul>
    
      <div class="actions">
          <button on:click={handleCreatePage}>+ New Page</button>
      </div>
    </aside>
  {/if}
  
  <style>
    .sidebar {
      position: absolute;         /* ✨ NEW */
      top: 0;
      left: 0;
      width: 250px;
      height: 100vh;
      background: #f4f4f4;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      padding: 1rem;
      box-sizing: border-box;
      z-index: 10;                /* keeps it above content */
    }
    
    .sidebar h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sidebar li {
      margin-bottom: 0.5rem;
    }
    

    .sidebar li.active {
      background: #ddd;
      font-weight: bold;
      border-radius: 4px;
    }

    .page-entry {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-entry .delete-button {
      display: none;
    }

    .page-entry:hover .delete-button {
      display: inline;
      background: none;
      border: none;
      color: #888;
      font-size: 0.6rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    
    a {
      display: block;
      text-decoration: none;
      color: inherit;
      background: none;
      border: none;
      text-align: left;
      width: 100%;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
    }

    .page-entry:hover {
      background: #eee;
    }

    li.active .page-entry:hover {
      background: none
    }
    
    .actions {
      margin-top: 2rem;
      text-align: left;
    }

    .actions button {
      background: none;
      border: 1px solid #ccc;
      color: #111;
      border-radius: 6px;
      padding: 0.75rem 1.25rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
    }

    .actions button:hover {
      background: #f3f3f3;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  </style>