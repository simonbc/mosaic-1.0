<script>
    import { editing, footerNav } from '@data/uiStore.js';
</script>

{#if !$editing}
<footer class="footer">
    {#each $footerNav as btn (btn.id)}
        <svelte:component this={btn.component} {...btn.props} />
    {/each}
</footer>
{/if}