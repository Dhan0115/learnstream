import './assets/css/main.css'
import './assets/scss/main.scss'

import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import { router } from './router'
import { loadSubjects } from './composables/useCatalog'
import { loadAccount } from './composables/useSession'

async function bootstrap() {
  // The account and the subject list are resolved before the first route, so
  // the router's auth guard and the header already know who is signed in, and
  // every screen can name a subject without a flash of "General".
  await Promise.all([loadAccount(), loadSubjects()])

  const app = createApp(App)

  app.use(router)
  app.use(ui)

  app.mount('#app')
}

void bootstrap()
