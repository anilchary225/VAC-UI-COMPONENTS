import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { ComponentsCatalogPage } from '../pages/ComponentsCatalogPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { CollectionsPage } from '../pages/CollectionsPage';
import { RecentlyViewedPage } from '../pages/RecentlyViewedPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: 'dashboard',
        element: <OverviewPage />,
      },
      {
        path: 'components',
        element: <ComponentsCatalogPage />,
      },
      {
        path: 'components/:slug',
        element: <ComponentsCatalogPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'history',
        element: <RecentlyViewedPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
