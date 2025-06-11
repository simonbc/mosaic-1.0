<script>
    import { editing, footerNav } from '@data/uiStore.js';
</script>

<footer class="footer" class:editing={$editing}>
    {#each $footerNav as btn (btn.id)}
        <svelte:component this={btn.component} {...btn.props} />
    {/each}
</footer>
