import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Toaster } from 'vue-sonner'
import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('Toaster', Toaster)

// Configurar listener de autenticación después de inicializar Pinia
const authStore = useAuthStore()
authStore.setupAuthListener()

app.mount('#app')
