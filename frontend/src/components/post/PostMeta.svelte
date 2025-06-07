<script>
    export let post
</script>

<div class="post-meta">
    <div>
        by <a href="#">{post.byline || `@${post.handle}`}</a>
         · {new Date(post.updatedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
        · {new Date(post.updatedAt).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        })}
    </div>
</div>