import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AsistenciaLocalService } from './asistencia-local.service';
import { MateriasService, Materia } from './materias.service';
import { EstudiantesService, Estudiante } from './estudiantes.service';

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

export interface AsistenciaRegistro {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  materiaId: number;
  materiaNombre: string;
  fecha: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA';
  observaciones?: string;
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
  private materiasService!: MateriasService;
  private estudiantesService!: EstudiantesService;

  constructor(private http: HttpClient) {
    this.asistenciaLocalService = inject(AsistenciaLocalService);
    this.materiasService = inject(MateriasService);
    this.estudiantesService = inject(EstudiantesService);
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

  updateAsistencia(id: number, datos: Partial<AsistenciaRegistro>): Observable<AsistenciaRegistro> {
    if (environment.useLocalStorage) {
      return new Observable(observer => {
        // Simular actualización en LocalStorage
        const asistencias = JSON.parse(localStorage.getItem('profesort_asistencias') || '[]');
        const index = asistencias.findIndex((a: any) => a.id === id);
        
        if (index !== -1) {
          asistencias[index] = { ...asistencias[index], ...datos };
          localStorage.setItem('profesort_asistencias', JSON.stringify(asistencias));
          observer.next(asistencias[index]);
          observer.complete();
        } else {
          observer.error(new Error('Asistencia no encontrada'));
        }
      });
    } else {
      return this.http.put<AsistenciaRegistro>(`${this.apiUrl}/${id}`, datos);
    }
  }

  deleteAsistencia(id: number): Observable<void> {
    if (environment.useLocalStorage) {
      return new Observable(observer => {
        const asistencias = JSON.parse(localStorage.getItem('profesort_asistencias') || '[]');
        const filtered = asistencias.filter((a: any) => a.id !== id);
        localStorage.setItem('profesort_asistencias', JSON.stringify(filtered));
        observer.next();
        observer.complete();
      });
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  }

  getAsistenciasByMateriaAndFecha(materiaId: number, fecha: string): Observable<AsistenciaRegistro[]> {
    if (environment.useLocalStorage) {
      return new Observable(observer => {
        const asistencias = JSON.parse(localStorage.getItem('profesort_asistencias') || '[]');
        const filtered = asistencias.filter((a: any) => 
          a.materiaId === materiaId && a.fecha === fecha
        );
        observer.next(filtered);
        observer.complete();
      });
    } else {
      return this.http.get<AsistenciaRegistro[]>(
        `${this.apiUrl}/materia/${materiaId}/fecha/${fecha}`
      );
    }
  }

  getAllAsistencias(): Observable<Asistencia[]> {
    if (environment.useLocalStorage) {
      return this.asistenciaLocalService.getAllAsistencias();
    } else {
      return this.http.get<Asistencia[]>(this.apiUrl);
    }
  }

  getAllAsistenciasEnriquecidas(): Observable<AsistenciaRegistro[]> {
    return forkJoin({
      asistencias: this.getAllAsistencias(),
      materias: this.materiasService.getMaterias(),
      estudiantes: this.estudiantesService.getEstudiantes()
    }).pipe(
      map(({ asistencias, materias, estudiantes }) => {
        return asistencias.map(asistencia => {
          const materia = materias.find(m => m.id === asistencia.id_materia);
          const estudiante = estudiantes.find(e => e.id === asistencia.id_estudiante);
          
          return {
            id: asistencia.id,
            estudianteId: asistencia.id_estudiante,
            estudianteNombre: estudiante ? `${estudiante.nombre} ${estudiante.apellido || ''}`.trim() : 'Estudiante Desconocido',
            materiaId: asistencia.id_materia,
            materiaNombre: materia ? materia.nombre : 'Materia Desconocida',
            fecha: asistencia.fecha,
            estado: asistencia.estado,
            observaciones: asistencia.observaciones || ''
          };
        });
      })
    );
  }


}
