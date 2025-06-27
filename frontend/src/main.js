import { mount } from 'svelte'
import App from './App.svelte'

import '../static/global.css'
import './components/post/post.css'
import './components/handle/handle.css'
import './components/editor/editor.css'

const target = document.getElementById('app')

const app = target ? mount(App, { target }) : null

// Hide SSR content once SPA is mounted
const ssr = document.getElementById('ssr')
if (ssr) {
  ssr.style.display = 'none'
}

export default app
