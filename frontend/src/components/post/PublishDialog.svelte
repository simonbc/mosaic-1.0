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
        disabled={!handle || isChecking || !handleAvailable}
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

<style>
  .publish-dialog {
    padding: 2rem;
    background: #fff;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 11;
  }

  @media (min-width: 768px) {
    .publish-dialog {
      border: 1px solid #ddd;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      margin: 0 auto;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 5rem;
      top: unset;
      left: unset;
      width: unset;
      height: unset;
    }
  }

  .byline-note {
    font-size: 0.7rem;
    opacity: 0.7;
    color: #888;
    margin-top: 0.25rem;
    margin-left: 1rem;
  }

  .handle-notice {
    margin-bottom: 1rem; 
    margin-left: 1rem;
    font-size: 0.75rem;
    line-height: 1;
  }

  .handle-notice.error {
    color: red;
  }

  .handle-notice.success {
    color: green;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9;
  }

  .overlay-close {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 9;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }


.handle-input-wrapper {
  position: relative;
  
}

.handle-prefix {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #555;
  pointer-events: none;
  font-size: 1rem;
}

.handle-input {
  padding-left: 2.5rem;
}

.handle-input,
.byline-input {
  max-width: 320px;
}

.publish-title {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.label {
  margin-bottom: 2.25rem;
}

.label.error {
  margin-bottom: 0.5rem;
}
</style>