<script>
  import { createEventDispatcher, onMount } from 'svelte';
  export let open = false;
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function onBackgroundClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  onMount(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
  });

  $: if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
</script>

{#if open}
  <div class="modal-background" on:click={onBackgroundClick}>
    <div class="modal-content">
      <button class="modal-close" on:click={close} aria-label="Close modal">&times;</button>
      <slot name="heading"></slot>
      <slot></slot>
    </div>
  </div>
{/if}

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 25px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    padding: 5rem;
    position: relative;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .modal-close:hover {
    transform: scale(1.1);
  }
</style>
