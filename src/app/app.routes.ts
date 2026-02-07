import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'table',
    loadComponent: () =>
      import('./features/table-view/table-view.component').then((m) => m.TableViewComponent)
  },
  {
    path: 'configuration',
    loadComponent: () =>
      import('./features/configuration/configuration.component').then((m) => m.ConfigurationComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
