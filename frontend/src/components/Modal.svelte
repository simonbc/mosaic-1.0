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

