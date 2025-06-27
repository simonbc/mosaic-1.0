<script>
  import { showPublishDialog } from '@data/uiStore.js'
  import { checkHandleAvailability } from '@data/posts.js'
  import { tick } from 'svelte'

  export let onSubmit = () => {};
  export let handle = '';
  export let byline = '';

  let handleError = '';

  let handleInput;
  let bylineInput;

  let handleAvailable = null;
  let isChecking = false;
  let checkTimeout;

  function handleSubmit() {
    if (!handle) {
      handleError = 'Required';
      return;
    }

    handleError = '';

    onSubmit()
    showPublishDialog.set(false)
  }

  function onHandleInput() {
    handle = handle.toLowerCase();
    handleAvailable = null;
    clearTimeout(checkTimeout);
    if (!handle) return;
    isChecking = true;
    checkTimeout = setTimeout(async () => {
      const available = await checkHandleAvailability(handle);
      handleAvailable = available;
      isChecking = false;
      await tick();
      if (!available) {
        handleError = 'Handle already taken';
      } else {
        handleError = '';
      }
    }, 400);
  }

  import { onMount } from 'svelte';


  onMount(() => {
    if (!handle) {
      handleInput?.focus();
    } else {
      bylineInput?.focus();
    }
  });
</script>

<div
  class="overlay"
  aria-modal="true"
>
  <div
    class="publish-dialog"
    role="dialog"
    tabindex="0"
    on:click|stopPropagation
    on:keydown|stopPropagation
  >
    <h3 class="publish-title">Publish to...</h3>
    <label class="label" class:error={handleAvailable !== null || isChecking === true}>
      <div class="handle-input-wrapper">
        <span class="handle-prefix">@</span>
        <input
          bind:this={handleInput}
          type="text"
          bind:value={handle}
          on:input={onHandleInput}
          class="handle-input"
          placeholder="pick a handle"
          tabindex="1"
        />
      </div>
    </label>
    {#if isChecking}
      <p class="handle-notice checking">Checking availability...</p>
    {:else if handle && handleAvailable === false}
      <p class="handle-notice error">Handle already taken</p>
    {:else if handle && handleAvailable === true}
      <p class="handle-notice success">Handle is available</p>
    {/if}
    {#if !handle && handleError}
      <p class="error">{handleError}</p>
    {/if}

    <h3 class="publish-title">Add a byline to your post</h3>
    <label class="label">
      <input
        class="byline-input"
        bind:this={bylineInput}
        bind:value={byline}
        placeholder="Anonymous or your name"
        tabindex="2"
      />
      <small class="byline-note">Optional — leave blank to publish anonymously.</small>
    </label>

    <div class="actions">
      <button
        type="button"
        class="btn"
        aria-label="Close dialog"
        on:click={() => showPublishDialog.set(false)}
        tabindex="4"
      >
        Close
      </button>
      <button
        class="btn btn-primary"
        on:click={handleSubmit}
        tabindex="3"
        disabled={!handle || isChecking || handleAvailable === false}
      >
        Publish
      </button>
    </div>
  </div>
  <button
    type="button"
    class="overlay-close"
    aria-label="Close dialog"
    on:click={() => showPublishDialog.set(false)}
  ></button>
</div>
