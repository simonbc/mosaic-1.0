<script>
  import { goto } from '../../routing.js'
  import { currentPost } from '@data/posts.js';
  import { deletePost } from '@data/db.js';
  import { deletePublishedPost } from '@data/posts.js';

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      if ($currentPost.published) {
        await deletePublishedPost($currentPost.handle, $currentPost.slug)
      }

      await deletePost($currentPost.id)
      goto('/')
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete the post. Please try again.')
    }
  }
</script>

<button class="btn btn-secondary" on:click={handleDelete}>
  <span class="btn-label">
    Delete
  </span>
</button>