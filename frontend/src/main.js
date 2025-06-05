import { mount } from 'svelte'
import App from './App.svelte'

export function mountApp(target) {
  new App({ target })
}

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
