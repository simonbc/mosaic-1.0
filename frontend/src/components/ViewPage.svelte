<script>
  import { onMount } from 'svelte'
  import { marked } from 'marked'


  export let docId
  export let currentRevision
  export let revisions

  let content = ''

  onMount(async () => {
    if (currentRevision) {
      content = currentRevision.content
    } else if (docId) {
      const latest = await revisions.getLatest()
      content = latest?.content || ''
    }
  })

  $: {
    if (currentRevision) {
      content = currentRevision.content
    } else if (docId) {
      revisions.getLatest().then(latest => {
        content = latest?.content || ''
      })
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