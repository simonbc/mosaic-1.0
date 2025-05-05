<script>
  import { showPublishDialog } from '../data/uiStore.js'
  import { pageData } from '../data/pagesStore.js'

  export let onSubmit = () => {};
  export let handle = '';
  export let byline = '';
  export let license = 'CC-BY';

  let handleError = '';
  let licenseError = '';

  const licenses = [
      'CC0',
      'CC-BY',
      'CC-BY-SA',
      'CC-BY-ND',
      'CC-BY-NC',
      'CC-BY-NC-SA',
      'CC-BY-NC-ND'
  ];

  const licenseDescriptions = {
      'CC0': 'No rights reserved — public domain.',
      'CC-BY': 'Credit must be given to the creator.',
      'CC-BY-SA': 'Credit and share alike.',
      'CC-BY-ND': 'Credit, no derivatives allowed.',
      'CC-BY-NC': 'Credit, non-commercial use only.',
      'CC-BY-NC-SA': 'Credit, non-commercial, share alike.',
      'CC-BY-NC-ND': 'Credit, non-commercial, no derivatives.'
  };

  function handleSubmit() {
    if (!handle) {
      handleError = 'Required';
      return;
    }
    if (!license) {
      licenseError = 'Required';
      return;
    }
    handleError = '';
    licenseError = '';

    onSubmit()
    showPublishDialog.set(false)
  }
</script>

{#if $showPublishDialog}
  <div class="overlay" on:click={() => showPublishDialog.set(false)}>
    <div class="publish-dialog" on:click|stopPropagation>
      {handle}
      <label>
        Handle:
        <input bind:value={handle} />
      </label>
      {#if !handle && handleError}
        <p class="error">{handleError}</p>
      {/if}
      <label>
        Byline:
        <input bind:value={byline} placeholder="Anonymous or your name" />
        <small class="byline-note">Optional — leave blank to publish anonymously.</small>
      </label>

      <label>
        <span>License: <span class="required">*</span></span>
        <select bind:value={license} required>
          {#each licenses as l}
            <option value={l}>{l}</option>
          {/each}
        </select>
        {#if !license && licenseError}
          <p class="error">{licenseError}</p>
        {/if}
        <p class="license-description">{licenseDescriptions[license]}</p>
        <p class="license-note">
          Publishing to Mosaic means sharing your words with the commons under a Creative Commons license. If you're not ready, keep writing privately.
        </p>
      </label>

      <button on:click={handleSubmit}>Publish</button>
    </div>
  </div>
{/if}

<style>
  .publish-dialog {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    max-width: 320px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin: 0 auto;
  }

  .publish-dialog label {
    display: flex;
    flex-direction: column;
    font-size: 0.95rem;
  }

  .publish-dialog input,
  .publish-dialog select {
    margin-top: 0.25rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .publish-dialog button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background: #222;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .publish-dialog button:hover {
    background: #000;
  }

  .license-description {
    font-size: 0.85rem;
    color: #555;
    margin: 0.25rem 0 0;
  }

  .license-note {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.5rem;
    line-height: 1.4;
  }

  .byline-note {
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .required {
    color: red;
    margin-left: 0;
  }

  .error {
    color: red;
    font-size: 0.75rem;
    margin-top: 0;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    z-index: 10;
  }
</style>