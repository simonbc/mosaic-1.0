<script>
    import { headerButtons } from '@data/uiStore.js';
</script>

<header class="app-header">
    <div class="logo">
        <a href="/">mosaic</a>
    </div>
    <nav class="menu">
        {#each $headerButtons as btn (btn.id)}
            <svelte:component this={btn.component} {...btn.props} />
        {/each}
        
            <!-- <a href="#">about</a>
            <a href="#">talk to us</a>
         -->
    </nav>
</header>

<style>
    .logo {
        display: flex;
        align-items: center;
        line-height: 1;
        padding-bottom: 6px;
    }
</style>