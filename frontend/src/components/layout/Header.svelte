<script>
    import { editing, headerNav } from '@data/uiStore.js';
</script>


<header class="app-header" class:editing={$editing}>
    <div class="logo">
        <a href="/">mosaic</a>
    </div>
    <nav class="menu">
        {#each $headerNav as btn (btn.id)}
            <svelte:component this={btn.component} {...btn.props} />
        {/each}
    </nav>
</header>
