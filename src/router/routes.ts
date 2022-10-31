import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        name: 'Activities',
        path: 'activities',
        component: () => import('pages/ActivitiesPage.vue'),
        children: [
          {
            name: 'CategoryActivities',
            path: 'c/:cid',
            component: () => import('pages/ActivitiesPage.vue'),
          },
        ],
      },
      {
        path: 'records',
        component: () => import('pages/RecordsPage.vue'),
        children: [
          {
            name: 'ActivityRecords',
            path: 'a/:aid',
            component: () => import('pages/RecordsPage.vue'),
          },
        ],
      },
      {
        path: 'history',
        component: () => import('pages/HistoryPage.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/SettingsPage.vue'),
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
