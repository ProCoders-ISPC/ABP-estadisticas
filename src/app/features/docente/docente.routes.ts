import { Routes } from '@angular/router';
import { Layout as DocenteLayout } from './layout/layout';
import { Estudiantes } from './estudiantes/estudiantes';
import { Materias } from './materias/materias';
import { TeacherGuard } from '../../core/guards/guards';

export const DOCENTE_ROUTES: Routes = [
  {
    path: '',
    component: DocenteLayout,
    canActivate: [TeacherGuard],
    children: [
      { path: '', loadComponent: () => import('./inicio/inicio').then(m => m.DocenteInicio) },
      { path: 'estudiantes', component: Estudiantes },
      { path: 'materias', component: Materias },
      { path: 'asistencia', loadComponent: () => import('./asistencia/asistencia').then(m => m.AsistenciaDocenteComponent) },
      { path: 'perfil', loadComponent: () => import('./perfil/perfil').then(m => m.DocentePerfil) }
    ]
  }
];