import { createApp } from 'vue'
import TgIcon from '@uno-ux/components/icon'
import App from './App.vue'
import '@uno-ux/theme-chalk/src/index.scss'

const app = createApp(App)
app.use(TgIcon)
app.mount('#app')
