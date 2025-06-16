<script>
  import { downloadExport } from '../utils/export'
</script>

<button class="link-btn" on:click={downloadExport}>↓ export backup</button>

<style>
    .link-btn {
        text-decoration: none;
    }
    .link-btn:hover {
        color: var(--color-accent);
        font-weight: unset;
        text-decoration-thickness: unset;
    }
</style>    