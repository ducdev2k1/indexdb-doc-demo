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
  {
    path: "/demo/search",
    component: () => import("../pages/demo/SearchDemo.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // chay localhost thì mới console
    if (import.meta.env.MODE === "ducnd") {
      console.log("🚀 index.ts ~ from :>>", from);
      console.log("🚀 index.ts ~ to :>>", to);
    }
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

export default router;
