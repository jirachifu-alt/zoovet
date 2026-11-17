import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · ZooVet',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent)
  },
  {
    path: 'registro',
    title: 'Crear cuenta · ZooVet',
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
        title: 'Panel general · ZooVet',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'mascotas',
        title: 'Mascotas · ZooVet',
        loadComponent: () => import('./pages/pets/pets.component').then((m) => m.PetsComponent)
      },
      {
        path: 'citas',
        title: 'Citas · ZooVet',
        loadComponent: () => import('./pages/appointments/appointments.component').then((m) => m.AppointmentsComponent)
      },
      {
        path: 'historial',
        title: 'Historial clínico · ZooVet',
        loadComponent: () => import('./pages/medical-records/medical-records.component').then((m) => m.MedicalRecordsComponent)
      },
      {
        path: 'vacunas',
        title: 'Vacunación · ZooVet',
        loadComponent: () => import('./pages/vaccines/vaccines.component').then((m) => m.VaccinesComponent)
      },
      {
        path: 'usuarios',
        title: 'Usuarios · ZooVet',
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
