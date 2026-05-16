import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'waiting-room' },
      {
        path: 'waiting-room',
        loadComponent: () => import('./pages/waiting-room/waiting-room.component').then((m) => m.WaitingRoomComponent),
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/schedule/schedule.component').then((m) => m.ScheduleComponent),
      },
      {
        path: 'patients/search',
        loadComponent: () => import('./pages/patient-search/patient-search.component').then((m) => m.PatientSearchComponent),
      },
      {
        path: 'patients/register',
        loadComponent: () => import('./pages/patient-register/patient-register.component').then((m) => m.PatientRegisterComponent),
      },
      {
        path: 'staff/register',
        loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'patients/:id',
        loadComponent: () => import('./pages/patient-detail/patient-detail.component').then((m) => m.PatientDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
