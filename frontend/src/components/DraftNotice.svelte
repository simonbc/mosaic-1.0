<script>
  import { draftCount, getDrafts } from '@data/posts'
  import Modal from './Modal.svelte'
  import PostMeta from '@components/post/PostMeta.svelte';

  let showModal = false
  let drafts = []

  $: hasDrafts = $draftCount > 0

  async function openModal() {
    drafts = await getDrafts()
    showModal = true
  }
</script>

{#if hasDrafts}
  <div class="notice">
    You have {$draftCount} local draft {$draftCount > 1 ? 'posts' : 'post'}.
    <a href="#" class="view-drafts" on:click={openModal}>View drafts</a>
  </div>
{/if}

<Modal open={showModal} on:close={() => (showModal = false)}>
  
  <div class="drafts">
    <ul class="list-unstyled">
      {#each drafts as draft}
        <li class="draft">
          <a class="draft-link" href="/draft/{draft.slug}">
            <div class="draft-excerpt">
              {#if draft.content}
                {draft.content.trim().slice(0, 50)}{draft.content.trim().length > 75 ? '…' : ''}
              {:else}
                {draft.slug}
              {/if}
            </div>
            <PostMeta post={draft} />
          </a>
        </li>
      {/each}
    </ul>
  </div>
  <div class="modal-footer">
    <button class="btn btn-sm" on:click={() => (showModal = false)}>Close</button>
  </div>
</Modal>

<style>
    .notice {
        font-size: 0.9rem;
    }

    .view-drafts {
      color: var(--color-text);
      font-weight: 500;
    }

    .drafts {
        max-height: 45vh;
        overflow-y: auto;
        margin: 1.5rem 0;
        padding: 0 1rem;
    }

    .draft {
        margin-bottom: 2rem;
        text-align: left;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }

    .draft:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .draft-link {
      font-family: var(--font-mono);
        text-decoration: none;
        color: inherit;
        display: block;
    }

    .draft-link:hover .draft-excerpt {
      text-decoration: underline;
      color: #111;
    }

    .draft-excerpt {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: #222;
    }

    .modal-footer {
      text-align: center;
      margin-top: 2rem;
    }
</style>