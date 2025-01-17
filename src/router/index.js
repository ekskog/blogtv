import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/BlogHome.vue'
import Post from '../components/BlogPost.vue'
import Posts from '../components/BlogPosts.vue'
import Search from '../components/BlogSearch.vue'
import RandomImage from '../components/BlogRandomimage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/posts', component: Posts },
  { path: '/search', component: Search },
  { path: '/rimg', component: RandomImage },
  // In your router config
  {
    path: '/post/:date',
    name: 'Post',
    component: Post,
    props: true,
    // Add a beforeEnter guard to handle the post content
    beforeEnter: (to, from, next) => {
      // Store the post content in a temporary router state
      to.meta.postContent = to.params.postContent
      next()
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
