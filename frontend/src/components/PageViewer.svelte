<script>
  import { onMount } from 'svelte'
  import { marked } from 'marked'

  import { pageData } from '../data/pagesStore.js'
  import { previewRevision } from '../data/uiStore.js'
</script>


<main>
  {#if $pageData}
    <h1>{$pageData.page.title}</h1>
    <article class="content">
        {@html marked.parse(
            $previewRevision 
                ? $previewRevision.content
                : $pageData.revision.content
      )}
    </article>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 2rem;
    background: #fefefe;
    color: #222;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  article.content {
    flex: 1;
    width: 100%;
    font-family: serif;
    font-size: 1.1rem;
    line-height: 1.5;
    overflow-y: auto;
    padding-top: 1rem;
  }
</style>