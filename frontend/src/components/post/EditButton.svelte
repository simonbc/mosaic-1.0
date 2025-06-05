<script>
  import { editing } from '@data/uiStore';
</script>

<button class="btn btn-secondary" on:click={() => editing.set(!$editing)}>
  Edit
</button>