import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InformesLocalService } from './informes-local.service';

export interface DistribucionArea {
  area: string;
  cantidad: number;
  porcentaje: number;
}

export interface CargaAcademica {
  docenteId: number;
  nombreDocente: string;
  cantidadMaterias: number;
  materias: string[];
  area: string;
}

export interface EstadisticasCarga {
  promedio: number;
  mediana: number;
  maximo: number;
  minimo: number;
  desviacionEstandar: number;
}


export interface DistribucionMaterias {
  area: string;
  totalMaterias: number;
  materiasAsignadas: number;
  materiasSinAsignar: number;
  porcentajeAsignadas: number;
  porcentajeSinAsignar: number;
}

export interface EstadisticasMaterias {
  totalMaterias: number;
  totalAsignadas: number;
  totalSinAsignar: number;
  porcentajeAsignacion: number;
  areasMayorAsignacion: string[];
  areasMenorAsignacion: string[];
}

// === INTERFACES PARA ESTUDIANTES ===
export interface EstadisticasEstudiantes {
  totalEstudiantes: number;
  estudiantesActivos: number;
  estudiantesInactivos: number;
  porcentajeActivos: number;
  promedioAsistencia: number;
}

export interface DistribucionEstudiantesPorArea {
  label: string;
  value: number;
}

export interface AsistenciaSemanal {
  semana: string;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  porcentaje: number;
}

export interface EstudianteConAsistencia {
  id: number;
  nombre: string;
  legajo: string;
  totalClases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  porcentajeAsistencia: number;
}

@Injectable({
  providedIn: 'root'
})
export class InformesService {
  private apiUrl = `${environment.apiUrl}`;
  private informesLocalService = inject(InformesLocalService);

  constructor(private http: HttpClient) {}

  
  getDistribucionPorArea(): Observable<DistribucionArea[]> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getDistribucionPorArea();
    }
    return this.http.get<DistribucionArea[]>(`${this.apiUrl}/informes/distribucion-areas`);
  }

  
  getCargaAcademica(): Observable<CargaAcademica[]> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getCargaAcademica();
    }
    return this.http.get<CargaAcademica[]>(`${this.apiUrl}/informes/carga-academica`);
  }

  
  getEstadisticasCarga(): Observable<EstadisticasCarga> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getEstadisticasCarga();
    }
    return this.http.get<EstadisticasCarga>(`${this.apiUrl}/informes/estadisticas-carga`);
  }

  getDistribucionMaterias(): Observable<DistribucionMaterias[]> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getDistribucionMaterias();
    }
    return this.http.get<DistribucionMaterias[]>(`${this.apiUrl}/informes/distribucion-materias`);
  }

 
  getEstadisticasMaterias(): Observable<EstadisticasMaterias> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getEstadisticasMaterias();
    }
    return this.http.get<EstadisticasMaterias>(`${this.apiUrl}/informes/estadisticas-materias`);
  }

  // === MÉTODOS PARA ESTUDIANTES ===
  getEstadisticasEstudiantes(): Observable<EstadisticasEstudiantes> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getEstadisticasEstudiantes();
    }
    return this.http.get<EstadisticasEstudiantes>(`${this.apiUrl}/informes/estadisticas-estudiantes`);
  }

  getDistribucionEstudiantesPorArea(): Observable<DistribucionEstudiantesPorArea[]> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getDistribucionEstudiantesPorArea();
    }
    return this.http.get<DistribucionEstudiantesPorArea[]>(`${this.apiUrl}/informes/distribucion-estudiantes`);
  }

  getAsistenciaSemanal(): Observable<AsistenciaSemanal[]> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getAsistenciaSemanal();
    }
    return this.http.get<AsistenciaSemanal[]>(`${this.apiUrl}/informes/asistencia-semanal`);
  }

  getEstudiantesConAsistencia(): Observable<EstudianteConAsistencia[]> {
    if (environment.useLocalStorage) {
      return this.informesLocalService.getEstudiantesConAsistencia();
    }
    return this.http.get<EstudianteConAsistencia[]>(`${this.apiUrl}/informes/estudiantes-asistencia`);
  }
}
