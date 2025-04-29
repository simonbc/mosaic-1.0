<script>
    import { createPage } from '../data/pages.js';
    import { slugify, navigateTo } from '../routing.js';
  
    function handleCreatePage() {
      const title = prompt('What’s the title of your new page?');
      if (!title) return;
  
      try {
        createPage(title);
        navigateTo(slugify(title));
      } catch (err) {
        alert('Error creating page: ' + err.message);
      }
    }
  </script>
  
  <main>
    <button on:click={handleCreatePage}>Create a new page</button>
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