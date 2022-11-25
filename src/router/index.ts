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
          children: [
            {
              name: 'AllActivities',
              path: '',
              component: () => import('@/pages/ActivitiesPage.vue'),
            },
            {
              name: 'CategoryActivities',
              path: 'c/:cid',
              component: () => import('@/pages/ActivitiesPage.vue'),
            },
            {
              name: 'ActivityRecords',
              path: 'a/:aid/records',
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
