import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EstudiantesLocalService, EstudianteLocal } from './estudiantes-local.service';

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
  dni: string;
  email: string;
  estado: string;
  is_active?: boolean;
  docenteId?: number;
  telefono?: string;
  cursoId?: number;
}

export interface EstudianteCrear {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  estado: string;
  docenteId: number;
}

export interface ErrorValidacion {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  errors?: ErrorValidacion[];
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {
  private apiUrl = environment.apiUrl + '/estudiantes';
  private useLocalStorage = environment.useLocalStorage;

  // Cache para optimizar rendimiento
  private estudiantesCache$ = new BehaviorSubject<Estudiante[]>([]);
  private estudiantesLoaded = false;

  constructor(
    private http: HttpClient,
    private estudiantesLocalService: EstudiantesLocalService
  ) {}

  /**
   * Obtener el listado completo de estudiantes con cache
   */
  getEstudiantes(): Observable<Estudiante[]> {
    if (this.estudiantesLoaded) {
      return this.estudiantesCache$.asObservable();
    }

    const source$ = this.useLocalStorage
      ? this.estudiantesLocalService.getEstudiantes().pipe(
          map((estudiantes: EstudianteLocal[]) => estudiantes.map((e: EstudianteLocal) => ({
            ...e,
          } as Estudiante)))
        )
      : this.http.get<Estudiante[]>(this.apiUrl);

    return source$.pipe(
      tap(estudiantes => {
        this.estudiantesCache$.next(estudiantes);
        this.estudiantesLoaded = true;
        console.log('👨‍🎓 Estudiantes cargados en cache:', estudiantes.length);
      }),
      catchError(error => {
        console.error('❌ Error cargando estudiantes:', error);
        this.estudiantesCache$.next([]);
        return of([]);
      })
    );
  }

  /**
   * Refrescar cache de estudiantes
   */
  refreshEstudiantes(): Observable<Estudiante[]> {
    this.estudiantesLoaded = false;
    return this.getEstudiantes();
  }

  /**
   * Invalidar cache después de operaciones CRUD
   */
  private updateCacheAfterOperation(): void {
    this.estudiantesLoaded = false;
    // No recargar automáticamente para evitar recursión
    // El siguiente getEstudiantes() lo recargará cuando sea necesario
  }

  /**
   * Obtener estudiantes asignados a un docente específico
   */
  getEstudiantesByDocenteId(docenteId: number): Observable<Estudiante[]> {
    if (this.useLocalStorage) {
      return this.estudiantesLocalService.getEstudiantes().pipe(
        map((estudiantes: EstudianteLocal[]) => {
          const filtrados = estudiantes.filter(e => e.docenteId === docenteId);
          return filtrados.map((e: EstudianteLocal) => ({
            ...e,
          } as Estudiante));
        })
      );
    }
    return this.http.get<Estudiante[]>(`${this.apiUrl}?docenteId=${docenteId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un estudiante por su ID
   */
  getEstudianteById(id: number): Observable<Estudiante> {
    if (this.useLocalStorage) {
      return this.estudiantesLocalService.getEstudiante(id).pipe(
        map((estudiante: EstudianteLocal | null) => {
          if (estudiante) {
            return {
              ...estudiante,
            } as Estudiante;
          }
          throw { message: 'Estudiante no encontrado' };
        })
      );
    }
    return this.http.get<Estudiante>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear un nuevo estudiante
   */
  crearEstudiante(data: EstudianteCrear): Observable<Estudiante> {
    const source$ = this.useLocalStorage
      ? this.estudiantesLocalService.addEstudiante({
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          email: data.email,
          legajo: `EST${Date.now().toString().slice(-3)}`,
          estado: data.estado as 'Activo' | 'Inactivo',
          docenteId: data.docenteId
        }).pipe(
          map((e: EstudianteLocal) => ({
            ...e,
          } as Estudiante))
        )
      : this.http.post<Estudiante>(this.apiUrl, data);

    return source$.pipe(
      tap(() => {
        this.updateCacheAfterOperation();
        // Disparar eventos de actualización
        window.dispatchEvent(new CustomEvent('estudiante-agregado'));
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un estudiante existente
   */
  actualizarEstudiante(id: number, data: Partial<Estudiante>): Observable<Estudiante> {
    const source$ = this.useLocalStorage
      ? (() => {
          const datosActualizar: Partial<EstudianteLocal> = {};
          
          if (data.nombre !== undefined) datosActualizar.nombre = data.nombre;
          if (data.apellido !== undefined) datosActualizar.apellido = data.apellido;
          if (data.dni !== undefined) datosActualizar.dni = data.dni;
          if (data.email !== undefined) datosActualizar.email = data.email;
          if (data.legajo !== undefined) datosActualizar.legajo = data.legajo;
          if (data.estado !== undefined) datosActualizar.estado = data.estado as 'Activo' | 'Inactivo';
          if (data.docenteId !== undefined) datosActualizar.docenteId = data.docenteId;
          
          return this.estudiantesLocalService.updateEstudiante(id, datosActualizar).pipe(
            map((e: EstudianteLocal) => ({
              ...e
            } as Estudiante))
          );
        })()
      : this.http.put<Estudiante>(`${this.apiUrl}/${id}`, data);

    return source$.pipe(
      tap(() => {
        this.updateCacheAfterOperation();
        // Disparar eventos de actualización
        window.dispatchEvent(new CustomEvent('estudiante-actualizado'));
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un estudiante
   */
  eliminarEstudiante(id: number): Observable<void> {
    const source$ = this.useLocalStorage
      ? this.estudiantesLocalService.deleteEstudiante(id)
      : this.http.delete<void>(`${this.apiUrl}/${id}`);

    return source$.pipe(
      tap(() => this.updateCacheAfterOperation()),
      catchError(this.handleError)
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorResponse: ErrorResponse;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (red, etc.)
      errorResponse = {
        message: `Error de conexión: ${error.error.message}`,
        errors: []
      };
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          // Errores de validación
          errorResponse = {
            message: error.error?.message || 'Datos inválidos',
            errors: error.error?.errors || []
          };
          break;
        case 404:
          errorResponse = {
            message: 'Estudiante no encontrado',
            errors: []
          };
          break;
        case 409:
          errorResponse = {
            message: 'El estudiante ya existe o hay un conflicto',
            errors: error.error?.errors || []
          };
          break;
        case 500:
          errorResponse = {
            message: 'Error interno del servidor',
            errors: []
          };
          break;
        default:
          errorResponse = {
            message: `Error ${error.status}: ${error.message}`,
            errors: []
          };
      }
    }

    return throwError(() => errorResponse);
  }

  /**
   * Formatear errores de validación para mostrar en la UI
   */
  formatearErroresValidacion(errors: ErrorValidacion[]): string {
    if (!errors || errors.length === 0) {
      return '';
    }
    
    return errors.map(error => `${error.field}: ${error.message}`).join('\n');
  }
}