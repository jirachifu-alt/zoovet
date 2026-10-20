import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'mascotas',
        loadComponent: () => import('./pages/pets/pets.component').then((m) => m.PetsComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./pages/appointments/appointments.component').then((m) => m.AppointmentsComponent)
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/medical-records/medical-records.component').then((m) => m.MedicalRecordsComponent)
      },
      {
        path: 'vacunas',
        loadComponent: () => import('./pages/vaccines/vaccines.component').then((m) => m.VaccinesComponent)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
