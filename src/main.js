import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'

import Home from './pages/Home.vue'
import Favorites from './pages/Favorites.vue'
import Profiles from './pages/Profiles.vue'
import Reg from './pages/Registration.vue'
import About from './pages/About.vue'
import Contact from './pages/Contact.vue'
import Privacy from './pages/Privacy.vue'
import Order from './pages/Order.vue'

const app = createApp(App)

const routes = [
  { path: '/registration', name: 'Reg', component: Reg },
  { path: '/', name: 'Home', component: Home },
  { path: '/favorites', name: 'Favorites', component: Favorites },
  { path: '/about', name: 'About', component: About },
  { path: '/contact', name: 'Contact', component: Contact },
  { path: '/privacy', name: 'Privacy', component: Privacy },
  { path: '/order', name: 'Order', component: Order },
  { path: '/profiles', name: 'Profiles', component: Profiles }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

app.use(router)
app.use(autoAnimatePlugin)

app.mount('#app')
