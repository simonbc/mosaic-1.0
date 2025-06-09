<script>
  import { settings } from '@data/settingsStore';
  import { cmdState } from '@data/uiStore';

  export let togglePreview;
</script>

<button class="btn btn-secondary hide-mobile" class:cmd-visible={$cmdState.cmd} on:click={() => togglePreview()}>
  <span class="btn-label">
    {$settings.showPreview ? 'Hide preview' : 'Show preview'}
  </span>
  {#if $cmdState.showHint}
    <span class="shortcut-hint">⌘P</span>
  {/if}
</button>