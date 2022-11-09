import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/pages/IndexPage.vue'),
        },
        {
          name: 'Activities',
          path: 'activities',
          component: () => import('@/pages/ActivitiesPage.vue'),
          children: [
            {
              name: 'CategoryActivities',
              path: 'c/:cid',
              component: () => import('@/pages/ActivitiesPage.vue'),
            },
          ],
        },
        {
          path: 'records',
          component: () => import('@/pages/RecordsPage.vue'),
          children: [
            {
              name: 'ActivityRecords',
              path: 'a/:aid',
              component: () => import('@/pages/RecordsPage.vue'),
            },
          ],
        },
        {
          path: 'history',
          component: () => import('@/pages/HistoryPage.vue'),
        },
      ],
    },
    {
      path: '/:catchAll(.*)*',
      component: () => import('@/pages/ErrorNotFound.vue'),
    },
  ],
});

export default router;
