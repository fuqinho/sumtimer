import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import IndexPage from '@/pages/IndexPage.vue';
import ActivitiesPage from '@/pages/ActivitiesPage.vue';
import RecordsPage from '@/pages/RecordsPage.vue';
import HistoryPage from '@/pages/HistoryPage.vue';
import ReportsPage from '@/pages/ReportsPage.vue';
import SettingsPage from '@/pages/SettingsPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash) return { selector: to.hash };
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          component: IndexPage,
        },
        {
          name: 'Activities',
          path: 'activities',
          children: [
            {
              name: 'AllActivities',
              path: '',
              component: ActivitiesPage,
            },
            {
              name: 'CategoryActivities',
              path: 'c/:cid',
              component: ActivitiesPage,
            },
            {
              name: 'ActivityRecords',
              path: 'a/:aid/records',
              component: RecordsPage,
            },
          ],
        },
        {
          path: 'history',
          component: HistoryPage,
        },
        {
          path: 'reports',
          component: ReportsPage,
        },
        {
          path: 'settings',
          component: SettingsPage,
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
