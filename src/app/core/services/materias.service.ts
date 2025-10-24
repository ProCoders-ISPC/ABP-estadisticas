
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AsignacionesService } from './asignaciones.service';
import { MateriasLocalService } from './materias-local.service';
import { switchMap, map, tap, shareReplay, catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

export interface DocenteSimple {
  id: number;
  id_usuario?: number; // Mantener compatibilidad
  name: string;
  legajo: string;
  dni?: string;
  email: string;
  area?: string;
}

export interface Materia {
  id: number;
  idmateria?: number; // Mantener compatibilidad con el frontend
  nombre: string;
  codigo: string;
  horas_semanales?: number;
  area?: string;
  nivel?: string;
  // Para mostrar datos del docente asignado (via JOIN con asignaciones)
  docenteId?: number | null;
  docenteNombre?: string | null;
  docenteLegajo?: string | null;
  docenteDni?: string | null;
  docenteEmail?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MateriasService {
  private apiUrl = `${environment.apiUrl}/materias`;
  private usersUrl = `${environment.apiUrl}/usuarios`;
  private useLocalStorage = environment.useLocalStorage;

  // Cache para optimizar rendimiento
  private materiasCache$ = new BehaviorSubject<Materia[]>([]);
  private docentesCache$ = new BehaviorSubject<DocenteSimple[]>([]);
  private materiasLoaded = false;
  private docentesLoaded = false;

  constructor(
    private http: HttpClient,
    private asignacionesService: AsignacionesService,
    private materiasLocalService: MateriasLocalService
  ) {}

  /**
   * Obtener todas las materias CON datos de docentes asignados
   * Con cache para optimizar rendimiento
   */
  getMaterias(): Observable<Materia[]> {
    if (this.materiasLoaded) {
      return this.materiasCache$.asObservable();
    }

    const source$ = this.useLocalStorage 
      ? this.materiasLocalService.getMaterias()
      : this.asignacionesService.getMateriasConDocentes();

    return source$.pipe(
      tap(materias => {
        this.materiasCache$.next(materias);
        this.materiasLoaded = true;
        console.log('📚 Materias cargadas en cache:', materias.length);
      }),
      catchError(error => {
        console.error('❌ Error cargando materias:', error);
        this.materiasCache$.next([]);
        return of([]);
      })
    );
  }

  /**
   * Refrescar cache de materias
   */
  refreshMaterias(): Observable<Materia[]> {
    this.materiasLoaded = false;
    return this.getMaterias();
  }

  /**
   * Obtener materias de un docente específico
   * Usa el servicio de asignaciones para filtrar por docente
   */
  getMateriasByDocente(docenteId: number): Observable<Materia[]> {
    if (this.useLocalStorage) {
      return this.materiasLocalService.getMateriasByDocente(docenteId);
    }
    return this.asignacionesService.getMateriasDeDocente(docenteId);
  }

  /**
   * Crear nueva materia (sin asignación de docente)
   */
  addMateria(materia: Omit<Materia, 'id'>): Observable<Materia> {
    const source$ = this.useLocalStorage 
      ? this.materiasLocalService.addMateria(materia)
      : this.http.post<Materia>(`${this.apiUrl}/`, materia);

    return source$.pipe(
      tap(() => {
        this.updateCacheAfterOperation();
        // Disparar eventos de actualización
        window.dispatchEvent(new CustomEvent('materia-agregada'));
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
      })
    );
  }

  /**
   * Actualizar materia
   */
  updateMateria(id: number, materia: Partial<Materia>): Observable<Materia> {
    const source$ = this.useLocalStorage 
      ? this.materiasLocalService.updateMateria(id, materia)
      : this.http.patch<Materia>(`${this.apiUrl}/${id}/`, materia);

    return source$.pipe(
      tap(() => {
        this.updateCacheAfterOperation();
        // Disparar eventos de actualización
        window.dispatchEvent(new CustomEvent('materia-actualizada'));
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
      })
    );
  }

  /**
   * Eliminar materia
   * También elimina las asignaciones relacionadas
   */
  deleteMateria(id: number): Observable<void> {
    if (this.useLocalStorage) {
      return this.materiasLocalService.deleteMateria(id).pipe(
        tap(() => {
          this.updateCacheAfterOperation();
          // Disparar eventos de actualización
          window.dispatchEvent(new CustomEvent('materia-eliminada'));
          window.dispatchEvent(new CustomEvent('datos-actualizados'));
        })
      );
    }
    
    // Eliminar asignaciones primero, luego la materia
    return this.asignacionesService.getAsignacionesByMateria(id).pipe(
      switchMap(asignaciones => {        
        if (asignaciones.length === 0) {
          return of([]); // No hay asignaciones que eliminar, continuar.
        }
        const deleteObservables = asignaciones.map(a => this.asignacionesService.eliminarAsignacion(a.id));
        return forkJoin(deleteObservables);
      }),      
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/${id}/`)),
      tap(() => {
        this.updateCacheAfterOperation();
        // Disparar eventos de actualización
        window.dispatchEvent(new CustomEvent('materia-eliminada'));
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
      })
    );
  }

  /**
   * Asignar o desasignar docente a materia
   * Usa la tabla de asignaciones_docentes_materias
   */
  asignarDocente(materiaId: number, docenteId: number | null): Observable<any> {
    const source$ = this.useLocalStorage 
      ? this.materiasLocalService.asignarDocente(materiaId, docenteId)
      : this.handleAsignacionDocente(materiaId, docenteId);

    return source$.pipe(
      tap(() => {
        this.updateCacheAfterOperation();
        // Disparar eventos de actualización
        window.dispatchEvent(new CustomEvent('asignacion-actualizada'));
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
      })
    );
  }

  private handleAsignacionDocente(materiaId: number, docenteId: number | null): Observable<any> {
    console.log('🎯 asignarDocente() llamado:', { materiaId, docenteId });
    
    // Primero obtener asignaciones actuales de esta materia específica
    return this.asignacionesService.getAsignacionesByMateria(materiaId).pipe(
      switchMap(asignaciones => {
        console.log('  📋 Asignaciones encontradas para materia', materiaId, ':', asignaciones);
        
        if (docenteId === null) {
          console.log('  ➡️ Desasignando docente...');
          // Eliminar asignación si existe
          if (asignaciones.length > 0) {
            console.log('  🗑️ Eliminando asignación ID:', asignaciones[0].id);
            return this.asignacionesService.eliminarAsignacion(asignaciones[0].id);
          }
          console.log('  ℹ️ No hay asignaciones para eliminar');
          return new Observable(observer => {
            observer.next(null);
            observer.complete();
          });
        } else {
          console.log('  ➡️ Asignando/actualizando docente a ID:', docenteId);
          
          if (asignaciones.length > 0) {
            // Ya existe una asignación para esta materia, actualizarla
            console.log('  ✏️ Actualizando asignación ID:', asignaciones[0].id, 'con docente:', docenteId);
            return this.asignacionesService.actualizarAsignacion(
              asignaciones[0].id,
              { id_usuario: docenteId, id_materia: materiaId, estado: 'ACTIVO' }
            );
          } else {
            // No existe asignación, crear una nueva
            console.log('  ➕ Creando nueva asignación para materia:', materiaId, 'docente:', docenteId);
            return this.asignacionesService.asignarDocenteAMateria(materiaId, docenteId);
          }
        }
      })
    );
  }

  /**
   * Obtener lista de docentes disponibles con cache
   */
  getDocentes(): Observable<DocenteSimple[]> {
    if (this.docentesLoaded) {
      return this.docentesCache$.asObservable();
    }

    const source$ = this.useLocalStorage 
      ? this.materiasLocalService.getDocentes()
      : this.http.get<any>(`${this.usersUrl}/?id_rol=2`).pipe(
          map(response => {
            const docentes = response.data || [];
            return docentes.map((docente: any) => ({
              ...docente,
              id_usuario: docente.id // Mapear id a id_usuario para compatibilidad
            }));
          })
        );

    return source$.pipe(
      tap(docentes => {
        this.docentesCache$.next(docentes);
        this.docentesLoaded = true;
        console.log('👨‍🏫 Docentes cargados en cache:', docentes.length);
      }),
      catchError(error => {
        console.error('❌ Error cargando docentes:', error);
        this.docentesCache$.next([]);
        return of([]);
      })
    );
  }

  /**
   * Invalidar cache después de operaciones CRUD
   */
  private updateCacheAfterOperation(): void {
    this.materiasLoaded = false;
    // No recargar automáticamente para evitar recursión
    // El siguiente getMaterias() lo recargará cuando sea necesario
  }
}
