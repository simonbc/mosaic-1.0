<script>
  import { editing, cmdState } from '@data/uiStore';
</script>

<button class="btn btn-secondary" class:cmd-visible={$cmdState.cmd} on:click={() => editing.set(!$editing)}>
  <span class="btn-label">
    Edit
  </span>
  {#if $cmdState.showHint}
    <span class="shortcut-hint">
      ⌘E
    </span>
  {/if}
</button>