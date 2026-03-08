import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'paths',
    loadComponent: () => import('./pages/paths/paths.component').then(m => m.PathsComponent),
  },
  {
    path: 'resume-scorer',
    loadComponent: () => import('./pages/resume-scorer/resume-scorer.component').then(m => m.ResumeScorerComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
