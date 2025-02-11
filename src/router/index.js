import { createRouter, createWebHistory } from 'vue-router'

import Archive from '@/components/BlogArchive.vue';
import Home from '@/components/BlogHome.vue';
import Post from '@/components/BlogPost.vue';
import Posts from '@/components/BlogPosts.vue';
import RandomImage from '@/components/BlogRandomimage.vue';
import Search from '@/components/BlogSearch.vue';

import TheHarp from '@/components/TabbedHarp.vue';
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
