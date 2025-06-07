<script>
  import { settings } from '@data/settingsStore';

  export let togglePreview;
</script>

<button class="btn btn-secondary hide-mobile" on:click={() => togglePreview()}>
  {$settings.showPreview ? 'Hide preview' : 'Show preview'}
</button>