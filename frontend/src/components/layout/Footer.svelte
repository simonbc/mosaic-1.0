<script>
    import { footerNav } from '@data/uiStore.js';
</script>

<footer class="footer">
    {#each $footerNav as btn (btn.id)}
        <svelte:component this={btn.component} {...btn.props} />
    {/each}
</footer>