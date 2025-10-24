import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AlertasEstadisticasService, AlertaEstadistica, MetricasEstadisticas } from '../../../../core/services/alertas-estadisticas.service';
import { EstudiantesService } from '../../../../core/services/estudiantes.service';
import { MateriasService } from '../../../../core/services/materias.service';
import { AsistenciaService } from '../../../../core/services/asistencia.service';

@Component({
  selector: 'app-alertas-recomendaciones',
  standalone: true,
  templateUrl: './alertas-recomendaciones.html',
  styleUrls: ['./alertas-recomendaciones.css'],
  imports: [CommonModule]
})
export class AlertasRecomendacionesComponent implements OnInit {
  alertas: AlertaEstadistica[] = [];
  metricas: MetricasEstadisticas | null = null;
  alertasFiltradas: AlertaEstadistica[] = [];
  filtroSeleccionado: 'todas' | 'critica' | 'advertencia' | 'info' = 'todas';
  cargando = true;
  mostrarDetalles: { [key: string]: boolean } = {};
  interpretacionMetricas = '';

  constructor(
    private alertasEstadisticasService: AlertasEstadisticasService,
    private estudiantesService: EstudiantesService,
    private materiasService: MateriasService,
    private asistenciaService: AsistenciaService
  ) {}

  ngOnInit(): void {
    this.cargarDatosYCalcularAlertas();
  }

  cargarDatosYCalcularAlertas(): void {
    console.log('[AlertasRecomendaciones] Iniciando carga de datos y cálculo de alertas...');
    this.cargando = true;
    
    // Verificar si ya tenemos datos y evitar bucle infinito
    if (this.alertas.length > 0 && !this.cargando) {
      console.log('[AlertasRecomendaciones] Alertas ya cargadas, evitando re-carga.');
      return;
    }
    
    // Cargar todos los datos necesarios en paralelo
    forkJoin({
      estudiantes: this.estudiantesService.getEstudiantes(),
      materias: this.materiasService.getMaterias(),
      docentes: this.materiasService.getDocentes(),
      asistencias: this.asistenciaService.getAllAsistencias()
    }).subscribe({
      next: ({ estudiantes, materias, docentes, asistencias }) => {
        console.log('[AlertasRecomendaciones] Datos base cargados:', {
          estudiantes: estudiantes.length,
          materias: materias.length,
          docentes: docentes.length,
          asistencias: asistencias.length
        });
        
        // Validar datos antes de calcular
        if (estudiantes.length === 0 || docentes.length === 0 || materias.length === 0) {
          console.warn('[AlertasRecomendaciones] Datos insuficientes para generar alertas');
          this.cargando = false;
          return;
        }
        
        // Calcular métricas y generar alertas
        try {
          this.alertasEstadisticasService.calcularMetricasYAlertas(
            estudiantes, 
            materias, 
            docentes, 
            asistencias
          ).subscribe({
            next: ({ metricas, alertas }) => {
              console.log('[AlertasRecomendaciones] Métricas y alertas calculadas:', { 
                metricas, 
                alertasCount: alertas.length 
              });
              this.metricas = metricas;
              this.alertas = alertas;
              this.interpretacionMetricas = this.alertasEstadisticasService.getInterpretacionMetricas(metricas);
              this.aplicarFiltro();
              this.cargando = false;
              console.log('📊 Sistema de alertas estadísticas activado con', alertas.length, 'alertas');
            },
            error: (err) => {
              console.error('[AlertasRecomendaciones] Error calculando métricas y alertas:', err);
              this.cargando = false;
            }
          });
        } catch (error) {
          console.error('[AlertasRecomendaciones] Error en cálculo de alertas:', error);
          this.cargando = false;
        }
      },
      error: (error) => {
        console.error('[AlertasRecomendaciones] Error al cargar datos para alertas:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroSeleccionado === 'todas') {
      this.alertasFiltradas = this.alertas;
    } else {
      this.alertasFiltradas = this.alertas.filter(
        alerta => alerta.tipo === this.filtroSeleccionado
      );
    }
  }

  cambiarFiltro(filtro: 'todas' | 'critica' | 'advertencia' | 'info'): void {
    this.filtroSeleccionado = filtro;
    this.aplicarFiltro();
  }

  toggleDetalles(alertaId: string): void {
    this.mostrarDetalles[alertaId] = !this.mostrarDetalles[alertaId];
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'critica': return 'fas fa-exclamation-circle';
      case 'advertencia': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  getIconoCategoria(categoria: string): string {
    switch (categoria) {
      case 'asistencia': return 'fas fa-user-check';
      case 'carga_docente': return 'fas fa-chalkboard-teacher';
      case 'materias': return 'fas fa-book';
      case 'distribucion': return 'fas fa-chart-pie';
      default: return 'fas fa-bell';
    }
  }

  getClaseTipo(tipo: string): string {
    switch (tipo) {
      case 'critica': return 'alerta-critica';
      case 'advertencia': return 'alerta-advertencia';
      case 'info': return 'alerta-informativa';
      default: return '';
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refrescarAlertas(): void {
    this.cargarDatosYCalcularAlertas();
  }

  // Getter para resumen de alertas - compatible con template
  get resumenAlertas() {
    return {
      totalAlertas: this.alertas.length,
      alertasCriticas: this.alertas.filter(a => a.tipo === 'critica').length,
      alertasAdvertencia: this.alertas.filter(a => a.tipo === 'advertencia').length,
      alertasInformativas: this.alertas.filter(a => a.tipo === 'info').length
    };
  }

  // Getters para métricas estadísticas
  get totalAlertas(): number {
    return this.alertas.length;
  }

  get alertasCriticas(): number {
    return this.alertas.filter(a => a.tipo === 'critica').length;
  }

  get alertasAdvertencia(): number {
    return this.alertas.filter(a => a.tipo === 'advertencia').length;
  }

  get alertasInfo(): number {
    return this.alertas.filter(a => a.tipo === 'info').length;
  }

  // Método para obtener texto de prioridad
  getPrioridadTexto(prioridad: number): string {
    switch (prioridad) {
      case 1: return 'Baja';
      case 2: return 'Media';
      case 3: return 'Alta';
      case 4: return 'Crítica';
      default: return 'No definida';
    }
  }
}
