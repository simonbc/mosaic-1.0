<script>
    import { createPost } from '@data/posts.js';
    import { loadPost } from '@data/posts.js';
    import { editing } from '@data/uiStore.js';
    import { currentSlug } from '../routing.js';
  
    async function createNewPost() {
      await createPost({ slug: $currentSlug });
      await loadPost($currentSlug);
      editing.set(true);
    }
  </script>
  
  <div class="not-found">
    <h1>Post not found</h1>
    <p><span class="slug">{$currentSlug}</span> does not exist.</p>
    <button class="btn btn-primary" on:click={createNewPost}>Create this post</button>
  </div>
  
  <style>
    .not-found {
      text-align: center;
    }

    .slug {
      font-family: var(--font-mono);
    }
  </style>