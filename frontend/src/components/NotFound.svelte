<script>
    import { createPost } from '@data/posts.js';
    import { loadPost } from '@data/posts.js';
    import { editing } from '@data/uiStore.js';
    import { deslugify, currentSlug } from '../routing.js';
  
    async function createNewPost() {
      await createPost();
      await loadPost($currentSlug);
      editing.set(true);
    }
  </script>
  
  <main class="not-found">
    <h1>Post not found</h1>
    <p>This post does not exist.</p>
    <button on:click={createNewPost}>Create this post</button>
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