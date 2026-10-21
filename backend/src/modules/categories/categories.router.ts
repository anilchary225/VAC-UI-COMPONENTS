import { Router, Request, Response } from 'express';
import { Category } from '@vac/shared';

export const categoriesRouter = Router();

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_all',
    name: 'All Components',
    slug: 'all',
    description: 'Browse the entire curated component catalog',
    icon: 'Layers',
    componentCount: 6,
  },
  {
    id: 'cat_forms',
    name: 'Forms & Authentication',
    slug: 'forms',
    description: 'Login forms, dropzones, inputs, and validation wrappers',
    icon: 'Lock',
    componentCount: 2,
  },
  {
    id: 'cat_nav',
    name: 'Navigation',
    slug: 'navigation',
    description: 'Headers, navbars, sidebars, and breadcrumb trails',
    icon: 'Compass',
    componentCount: 1,
  },
  {
    id: 'cat_marketing',
    name: 'Marketing & Sales',
    slug: 'marketing',
    description: 'Pricing tables, feature highlights, and hero units',
    icon: 'CreditCard',
    componentCount: 1,
  },
  {
    id: 'cat_data',
    name: 'Data & Dashboards',
    slug: 'data',
    description: 'Analytics widgets, metric cards, and charts',
    icon: 'BarChart3',
    componentCount: 1,
  },
  {
    id: 'cat_overlays',
    name: 'Feedback & Overlays',
    slug: 'feedback',
    description: 'Notification centers, modals, toasts, and popovers',
    icon: 'Bell',
    componentCount: 1,
  },
];

categoriesRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: DEFAULT_CATEGORIES,
  });
});
