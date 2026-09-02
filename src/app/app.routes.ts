import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public Savana Sushi Hub Portal
  { path: '', component: HomeComponent },

  // Management / CMS Authentication
  {
    path: 'management/login',
    loadComponent: () =>
      import('./components/management/management-login/management-login.component').then(
        (m) => m.ManagementLoginComponent
      )
  },

  // Protected Management Area
  {
    path: 'management',
    loadComponent: () =>
      import('./components/management/management-layout/management-layout.component').then(
        (m) => m.ManagementLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./components/management/management-overview/management-overview.component').then(
            (m) => m.ManagementOverviewComponent
          )
      },
      {
        path: 'company',
        loadComponent: () =>
          import('./components/management/management-company/management-company.component').then(
            (m) => m.ManagementCompanyComponent
          )
      },
      {
        path: 'branches',
        loadComponent: () =>
          import('./components/management/management-branches/management-branches.component').then(
            (m) => m.ManagementBranchesComponent
          )
      },
      {
        path: 'branches/create',
        loadComponent: () =>
          import('./components/management/management-branch-form/management-branch-form.component').then(
            (m) => m.ManagementBranchFormComponent
          )
      },
      {
        path: 'branches/edit/:identifier',
        loadComponent: () =>
          import('./components/management/management-branch-form/management-branch-form.component').then(
            (m) => m.ManagementBranchFormComponent
          )
      }
    ]
  },

  // Fallback Wildcard
  { path: '**', redirectTo: '' }
];
