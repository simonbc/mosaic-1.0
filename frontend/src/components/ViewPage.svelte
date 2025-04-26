<script>
  import { onMount } from 'svelte'
  import { marked } from 'marked'


  export let docId
  export let selectedRevision
  export let revisions

  let content = ''

  onMount(async () => {
    if (selectedRevision) {
      content = selectedRevision.content || ''
    } else if (docId) {
      const latest = await revisions.getLatest()
      content = latest?.content || ''
    }
  })

  $: {
  if (selectedRevision) {
    content = selectedRevision.content || ''
  } else if ($revisions.length > 0) {
    content = $revisions[0].content || ''
  } else {
    content = ''
  }
}
</script>

<main class="viewer-container">
  {@html marked(content)}
</main>

<style>
  .viewer-container {
    padding: 1rem;
  }
</style>