import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EstudiantesLocalService, EstudianteLocal } from './estudiantes-local.service';

export interface Estudiante {
  legajo: any;
  id: number;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  estado: string;
  is_active?: boolean;
  docenteId?: number;
}

export interface EstudianteCrear {
  nombre: string;
  apellidos: string;
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

  constructor(
    private http: HttpClient,
    private estudiantesLocalService: EstudiantesLocalService
  ) {}

  /**
   * Obtener el listado completo de estudiantes
   */
  getEstudiantes(): Observable<Estudiante[]> {
    if (this.useLocalStorage) {
      return this.estudiantesLocalService.getEstudiantes().pipe(
        map((estudiantes: EstudianteLocal[]) => estudiantes.map((e: EstudianteLocal) => ({
          ...e,
          apellidos: e.apellido
        } as Estudiante)))
      );
    }
    return this.http.get<Estudiante[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
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
            apellidos: e.apellido
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
              apellidos: estudiante.apellido
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
    if (this.useLocalStorage) {
      const nuevoEstudiante: Omit<EstudianteLocal, 'id'> = {
        nombre: data.nombre,
        apellido: data.apellidos,
        dni: data.dni,
        email: data.email,
        legajo: `EST${Date.now().toString().slice(-3)}`,
        estado: data.estado as 'Activo' | 'Inactivo',
        docenteId: data.docenteId
      };
      return this.estudiantesLocalService.addEstudiante(nuevoEstudiante).pipe(
        map((e: EstudianteLocal) => ({
          ...e,
          apellidos: e.apellido
        } as Estudiante))
      );
    }
    return this.http.post<Estudiante>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un estudiante existente
   */
  actualizarEstudiante(id: number, data: Partial<Estudiante>): Observable<Estudiante> {
    if (this.useLocalStorage) {
      const datosActualizar: Partial<EstudianteLocal> = {};
      
      if (data.nombre !== undefined) datosActualizar.nombre = data.nombre;
      if (data.apellidos !== undefined) datosActualizar.apellido = data.apellidos;
      if (data.dni !== undefined) datosActualizar.dni = data.dni;
      if (data.email !== undefined) datosActualizar.email = data.email;
      if (data.legajo !== undefined) datosActualizar.legajo = data.legajo;
      if (data.estado !== undefined) datosActualizar.estado = data.estado as 'Activo' | 'Inactivo';
      if (data.docenteId !== undefined) datosActualizar.docenteId = data.docenteId;
      
      return this.estudiantesLocalService.updateEstudiante(id, datosActualizar).pipe(
        map((e: EstudianteLocal) => ({
          ...e,
          apellidos: e.apellido
        } as Estudiante))
      );
    }
    return this.http.put<Estudiante>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un estudiante
   */
  eliminarEstudiante(id: number): Observable<void> {
    if (this.useLocalStorage) {
      return this.estudiantesLocalService.deleteEstudiante(id);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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