import { createRouter, createWebHistory } from 'vue-router'

import Archive from '@/components/BlogArchive.vue';
import Home from '@/components/BlogHome.vue';
import Post from '@/components/BlogPost.vue';
import Posts from '@/components/BlogPosts.vue';
import RandomImage from '@/components/BlogRandomimage.vue';
import Search from '@/components/BlogSearch.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/archive', component: Archive },
  { path: '/posts', component: Posts },
  {
    path: '/search',
    name: 'search',
    component: Search,
  },
  { path: '/rimg', component: RandomImage },
  {
    path: '/post/:date',
    name: 'Post',
    component: Post,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
