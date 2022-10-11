import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'categories',
        component: () => import('pages/CategoriesPage.vue'),
      },
      {
        path: 'activities',
        component: () => import('pages/ActivitiesPage.vue'),
      },
      {
        path: 'records',
        component: () => import('pages/RecordsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
