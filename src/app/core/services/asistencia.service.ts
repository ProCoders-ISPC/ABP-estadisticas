import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AsistenciaLocalService } from './asistencia-local.service';

export interface Asistencia {
  id: number;
  id_estudiante: number;
  id_materia: number;
  id_docente: number;
  fecha: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA';
  observaciones?: string;
  created_at: string;
}

export interface EstudianteAsistencia {
  id: number;
  nombre: string;
  legajo: string;
  estado?: 'PRESENTE' | 'AUSENTE' | 'TARDANZA';
  asistenciaId?: number;
}

export interface ResumenAsistencia {
  totalClases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  porcentajeAsistencia: number;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = `${environment.apiUrl}/asistencias`;
  private asistenciaLocalService!: AsistenciaLocalService;

  constructor(private http: HttpClient) {
    this.asistenciaLocalService = inject(AsistenciaLocalService);
  }

  getAsistenciasByMateria(materiaId: number): Observable<Asistencia[]> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.getAsistenciasByMateria(materiaId);
    }
    return this.http.get<Asistencia[]>(`${this.apiUrl}/materia/${materiaId}`);
  }

  getAsistenciasByEstudiante(estudianteId: number): Observable<Asistencia[]> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.getAsistenciasByEstudiante(estudianteId);
    }
    return this.http.get<Asistencia[]>(`${this.apiUrl}/estudiante/${estudianteId}`);
  }

  getAsistenciasByMateriaYFecha(materiaId: number, fecha: string): Observable<Asistencia[]> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.getAsistenciasByMateriaYFecha(materiaId, fecha);
    }
    return this.http.get<Asistencia[]>(`${this.apiUrl}/materia/${materiaId}/fecha/${fecha}`);
  }

  registrarAsistenciaLote(asistencias: Omit<Asistencia, 'id' | 'created_at'>[]): Observable<Asistencia[]> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.registrarAsistenciaLote(asistencias);
    }
    return this.http.post<Asistencia[]>(`${this.apiUrl}/lote`, asistencias);
  }

  actualizarAsistencia(id: number, datos: Partial<Asistencia>): Observable<boolean> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.actualizarAsistencia(id, datos);
    }
    return this.http.put<boolean>(`${this.apiUrl}/${id}`, datos);
  }

  getResumenAsistenciaEstudiante(estudianteId: number, materiaId?: number): Observable<ResumenAsistencia> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.getResumenAsistenciaEstudiante(estudianteId, materiaId);
    }
    const url = materiaId 
      ? `${this.apiUrl}/resumen/estudiante/${estudianteId}/materia/${materiaId}`
      : `${this.apiUrl}/resumen/estudiante/${estudianteId}`;
    return this.http.get<ResumenAsistencia>(url);
  }
}
