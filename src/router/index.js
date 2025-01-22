import { createRouter, createWebHistory } from 'vue-router'

import Archive from '@/components/BlogArchive.vue';
import Home from '@/components/BlogHome.vue';
import Post from '@/components/BlogPost.vue';
import Posts from '@/components/BlogPosts.vue';
import RandomImage from '@/components/BlogRandomimage.vue';
import Search from '@/components/BlogSearch.vue';

import TheHarp from '@/components/TheHarp.vue';
import MusicAlbum from '@/components/MusicAlbum.vue';

import loadAlbums from '@/utils/loadAlbums';

const albums = loadAlbums();
const routes = [
  {
    path: '/the-harp',
    component: TheHarp
  },
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
    props: true,
    // Add a beforeEnter guard to handle the post content
    beforeEnter: (to, from, next) => {
      // Store the post content in a temporary router state
      to.meta.postContent = to.params.postContent
      next()
    },
  },
];

albums.forEach(album => {
  routes.push({
    path: album.route,
    component: MusicAlbum,
    props: { albumName: album.name, songs: album.songs }
  });
});

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
