<script>
  import { onMount } from 'svelte';

  import { editing } from "@data/uiStore";
  import { settings } from '@data/settingsStore.js';
  import { currentPost } from '@data/posts';
  import Revisions from './Revisions.svelte';

  export let toggleShowRevisions;

  let dropdownRef;

  onMount(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef && !$editing && !dropdownRef.contains(event.target)) {
            settings.update(s => ({ ...s, showRevisions: false }));
        }
    }
    document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });
</script>

{#if $currentPost.revisions.length > 1}
    <div class="revisions-container">
        <button class="btn btn-secondary" bind:this={dropdownRef} on:click={() => toggleShowRevisions()}>
            Revisions
        </button>
        <Revisions />
    </div>
{/if}


<style>
    .revisions-container {
        position: relative;
        display: inline-block;
    }
</style>