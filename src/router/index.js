import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/components/BlogHome.vue'
import Posts from '@/components/BlogPosts.vue'
import Search from '@/components/BlogSearch.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/posts', component: Posts },
  {
    path: '/search',
    name: 'search',
    component: Search,
    props: (route) => ({ tag: route.query.tag }), // Pass the 'tag' query to the Search component as a prop
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
