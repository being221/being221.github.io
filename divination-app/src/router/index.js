import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Result from '../views/Result.vue'
import History from '../views/History.vue'
import Templates from '../views/Templates.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/result',
    name: 'Result',
    component: Result
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/templates',
    name: 'Templates',
    component: Templates
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router