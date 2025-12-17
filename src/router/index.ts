import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import IndexDBDoc from "../pages/docs/IndexDB.md";

const routes = [
  { path: "/", component: Home },
  { path: "/docs/indexdb", component: IndexDBDoc },
  {
    path: "/demo/indexdb",
    component: () => import("../pages/demo/IndexDBDemo.vue"),
  },
  {
    path: "/demo/gallery",
    component: () => import("../pages/demo/ImageGallery.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
