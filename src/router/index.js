import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/BlogHome.vue";
import Posts from "../components/BlogPosts.vue";
import Search from "../components/BlogSearch.vue";
import RandomImage from "../components/BlogRandomimage.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/posts", component: Posts },
  { path: "/search", component: Search },
  { path: "/rimg", component: RandomImage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
