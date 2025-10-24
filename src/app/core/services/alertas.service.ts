import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AsistenciaService } from './asistencia.service';
import { AlertasEstadisticasService, AlertaEstadistica } from './alertas-estadisticas.service';
import { EstudiantesService } from './estudiantes.service';
import { MateriasService } from './materias.service';
import { AdminDocenteService } from './admindocente.service';

export interface Alerta {
  id: string;
  tipo: 'critica' | 'advertencia' | 'informativa';
  categoria: 'asistencia' | 'carga-docente' | 'materias' | 'distribucion';
  titulo: string;
  mensaje: string;
  accionRecomendada: string;
  datosAdicionales?: any;
  timestamp: Date;
  prioridad: number; // 1-5, donde 5 es más crítico
}

export interface ResumenAlertas {
  totalAlertas: number;
  alertasCriticas: number;
  alertasAdvertencia: number;
  alertasInformativas: number;
  alertas: Alerta[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  
  constructor(
    private alertasEstadisticasService: AlertasEstadisticasService,
    private estudiantesService: EstudiantesService,
    private materiasService: MateriasService,
    private asistenciaService: AsistenciaService,
    private docenteService: AdminDocenteService
  ) {}

  getAlertas(): Observable<ResumenAlertas> {
    return combineLatest([
      this.estudiantesService.getEstudiantes(),
      this.materiasService.getMaterias(),
      this.docenteService.getDocentesCarga(),
      this.asistenciaService.getAllAsistencias()
    ]).pipe(
      switchMap(([estudiantes, materias, docentes, asistencias]) => 
        this.alertasEstadisticasService.calcularMetricasYAlertas(
          estudiantes, materias, docentes, asistencias
        )
      ),
      map(({ alertas }) => {
        const alertasMapeadas: Alerta[] = alertas.map(a => this.mapToAlerta(a));
        const resumen = {
          totalAlertas: alertasMapeadas.length,
          alertasCriticas: alertasMapeadas.filter(a => a.tipo === 'critica').length,
          alertasAdvertencia: alertasMapeadas.filter(a => a.tipo === 'advertencia').length,
          alertasInformativas: alertasMapeadas.filter(a => a.tipo === 'informativa').length,
          alertas: alertasMapeadas.sort((a, b) => b.prioridad - a.prioridad)
        };

        localStorage.setItem('profesort_alertas', JSON.stringify(resumen.alertas));
        window.dispatchEvent(new CustomEvent('alertas-actualizadas', { detail: resumen }));

        return resumen;
      }),
      catchError(err => {
        console.error('Error critico en el nuevo getAlertas:', err);
        return of({ totalAlertas: 0, alertasCriticas: 0, alertasAdvertencia: 0, alertasInformativas: 0, alertas: [] });
      })
    );
  }

  private mapToAlerta(alertaEst: AlertaEstadistica): Alerta {
    return {
      id: alertaEst.id,
      tipo: alertaEst.tipo === 'info' ? 'informativa' : alertaEst.tipo,
      categoria: alertaEst.categoria.replace('_', '-') as any,
      titulo: alertaEst.titulo,
      mensaje: alertaEst.descripcion,
      accionRecomendada: alertaEst.recomendacion,
      datosAdicionales: alertaEst.datosAdicionales,
      timestamp: alertaEst.timestamp,
      prioridad: alertaEst.prioridad
    };
  }
}