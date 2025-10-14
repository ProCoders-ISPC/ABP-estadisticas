import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocalStorageService, AsistenciaLocal } from './local-storage.service';
import { Asistencia, ResumenAsistencia } from './asistencia.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaLocalService {
  private localStorageService = inject(LocalStorageService);

  getAsistenciasByMateria(materiaId: number): Observable<Asistencia[]> {
    const asistencias = this.localStorageService.getAsistenciasByMateria(materiaId);
    return of(asistencias as Asistencia[]);
  }

  getAsistenciasByEstudiante(estudianteId: number): Observable<Asistencia[]> {
    const asistencias = this.localStorageService.getAsistenciasByEstudiante(estudianteId);
    return of(asistencias as Asistencia[]);
  }

  getAsistenciasByMateriaYFecha(materiaId: number, fecha: string): Observable<Asistencia[]> {
    const asistencias = this.localStorageService.getAsistenciasByMateriaYFecha(materiaId, fecha);
    return of(asistencias as Asistencia[]);
  }

  registrarAsistenciaLote(asistencias: Omit<AsistenciaLocal, 'id' | 'created_at'>[]): Observable<Asistencia[]> {
    const nuevasAsistencias = this.localStorageService.addAsistenciasLote(asistencias);
    return of(nuevasAsistencias as Asistencia[]);
  }

  actualizarAsistencia(id: number, datos: Partial<AsistenciaLocal>): Observable<boolean> {
    const success = this.localStorageService.updateAsistencia(id, datos);
    return of(success);
  }

  getResumenAsistenciaEstudiante(estudianteId: number, materiaId?: number): Observable<ResumenAsistencia> {
    let asistencias = this.localStorageService.getAsistenciasByEstudiante(estudianteId);
    
    if (materiaId) {
      asistencias = asistencias.filter(a => a.id_materia === materiaId);
    }

    const totalClases = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
    const ausentes = asistencias.filter(a => a.estado === 'AUSENTE').length;
    const tardanzas = asistencias.filter(a => a.estado === 'TARDANZA').length;
    
    const porcentajeAsistencia = totalClases > 0 
      ? ((presentes + (tardanzas * 0.5)) / totalClases) * 100 
      : 0;

    const resumen: ResumenAsistencia = {
      totalClases,
      presentes,
      ausentes,
      tardanzas,
      porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100
    };

    return of(resumen);
  }

  getAllAsistencias(): Observable<Asistencia[]> {
    const asistencias = this.localStorageService.getAsistencias();
    return of(asistencias as Asistencia[]);
  }
}
