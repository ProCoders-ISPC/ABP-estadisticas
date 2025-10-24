import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { AsistenciaService, AsistenciaRegistro } from 'src/app/core/services/asistencia.service';
import { MateriasService, Materia } from 'src/app/core/services/materias.service';
import { EstudiantesService } from 'src/app/core/services/estudiantes.service';
import { AlertasEstadisticasService, MetricasEstadisticas } from 'src/app/core/services/alertas-estadisticas.service';

@Component({
  selector: 'app-admin-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-asistencia.html',
  styleUrls: ['./admin-asistencia.css']
})
export class AdminAsistenciaComponent implements OnInit {
  asistencias: AsistenciaRegistro[] = [];
  materias: Materia[] = [];
  asistenciasFiltradas: AsistenciaRegistro[] = [];
  
  // Métricas estadísticas en tiempo real
  metricas: MetricasEstadisticas | null = null;
  promedioAsistenciaGeneral = 0;
  estudiantesCriticos: any[] = [];
  estudiantesEnRiesgo: any[] = [];
  
  // Filtros
  materiaSeleccionada = '';
  fechaInicio = '';
  fechaFin = '';
  estadoFiltro = '';
  
  // Modal
  mostrarModalEditar = false;
  asistenciaEditar: AsistenciaRegistro | null = null;
  
  // Estado
  cargando = false;
  mensaje = '';
  error = '';

  constructor(
    private asistenciaService: AsistenciaService,
    private materiasService: MateriasService,
    private estudiantesService: EstudiantesService,
    private alertasEstadisticasService: AlertasEstadisticasService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  /**
   * Cargar todos los datos necesarios y calcular métricas
   */
  private cargarDatosIniciales(): void {
    console.log('[AdminAsistencia] Iniciando carga de datos iniciales...');
    this.cargando = true;
    this.error = '';

    console.log('[AdminAsistencia] DEBUG: Configurando forkJoin para datos base...');
    forkJoin({
      materias: this.materiasService.getMaterias().pipe(
        tap(data => console.log(`[AdminAsistencia] DEBUG: 📚 Materias recibidas: ${data.length} registros.`))
      ),
      estudiantes: this.estudiantesService.getEstudiantes().pipe(
        tap(data => console.log(`[AdminAsistencia] DEBUG: 👨‍🎓 Estudiantes recibidos: ${data.length} registros.`))
      ),
      docentes: this.materiasService.getDocentes().pipe(
        tap(data => console.log(`[AdminAsistencia] DEBUG: 👨‍🏫 Docentes recibidos: ${data.length} registros.`))
      )
    }).pipe(
      tap(() => console.log('[AdminAsistencia] DEBUG: ✅ forkJoin para datos base completado.')),
      switchMap(({ materias, estudiantes, docentes }) => {
        console.log('[AdminAsistencia] DEBUG: 📦 Datos base procesados. Cargando asistencias enriquecidas...');
        this.materias = materias;
        
        return this.asistenciaService.getAllAsistenciasEnriquecidas().pipe(
          tap(data => console.log(`[AdminAsistencia] DEBUG: 📋 Asistencias enriquecidas recibidas: ${data.length} registros.`)),
          switchMap(asistenciasEnriquecidas => {
            console.log('[AdminAsistencia] DEBUG: Asistencias enriquecidas procesadas. Calculando métricas...');
            this.asistencias = asistenciasEnriquecidas;
            this.aplicarFiltros();

            if (asistenciasEnriquecidas.length === 0) {
              console.log('[AdminAsistencia] DEBUG: No hay asistencias, se omiten las métricas y se finaliza.');
              this.metricas = null;
              this.promedioAsistenciaGeneral = 0;
              this.estudiantesCriticos = [];
              this.estudiantesEnRiesgo = [];
              return of(null); 
            }
            
            console.log('[AdminAsistencia] DEBUG: 📞 Llamando a calcularMetricasYAlertas...');
            return this.alertasEstadisticasService.calcularMetricasYAlertas(
              estudiantes, materias, docentes, this.asistencias
            ).pipe(
              tap(({ metricas }) => {
                console.log('[AdminAsistencia] DEBUG: 📊 Métricas y alertas calculadas.');
                this.metricas = metricas;
                this.promedioAsistenciaGeneral = metricas.promedio_asistencia;
                console.log('[AdminAsistencia] DEBUG: 📉 Calculando estudiantes críticos y en riesgo...');
                this.calcularEstudiantesCriticosYRiesgo(estudiantes, asistenciasEnriquecidas);
                console.log('[AdminAsistencia] DEBUG: ✅ Finalizado el cálculo de estudiantes.');
              })
            );
          })
        );
      }),
      catchError(err => {
        console.error('[AdminAsistencia] DEBUG: ❌ Error en el pipeline de carga de datos:', err);
        this.error = 'Error al cargar y procesar los datos de asistencia.';
        return of(null);
      }),
      finalize(() => {
        this.cargando = false;
        console.log('[AdminAsistencia] DEBUG: 🏁 Pipeline de carga finalizado. `cargando` puesto a false.');
      })
    ).subscribe();
  }

  /**
   * Identificar estudiantes críticos y en riesgo con datos específicos
   */
  private calcularEstudiantesCriticosYRiesgo(estudiantes: any[], asistencias: any[]): void {
    const asistenciaPorEstudiante = new Map<number, { presentes: number; total: number; estudiante: any }>();
    
    // Agregar todos los estudiantes
    estudiantes.forEach(estudiante => {
      asistenciaPorEstudiante.set(estudiante.id, {
        presentes: 0,
        total: 0,
        estudiante
      });
    });

    // Contar asistencias
    asistencias.forEach(asistencia => {
      const estudianteId = asistencia.estudiante_id || asistencia.id_estudiante;
      if (asistenciaPorEstudiante.has(estudianteId)) {
        const datos = asistenciaPorEstudiante.get(estudianteId)!;
        datos.total++;
        if (asistencia.estado === 'PRESENTE' || asistencia.presente) {
          datos.presentes++;
        }
      }
    });

    // Clasificar estudiantes
    this.estudiantesCriticos = [];
    this.estudiantesEnRiesgo = [];

    asistenciaPorEstudiante.forEach((datos, estudianteId) => {
      const porcentaje = datos.total > 0 ? (datos.presentes / datos.total) * 100 : 0;
      
      if (porcentaje < 60) {
        this.estudiantesCriticos.push({
          ...datos.estudiante,
          porcentajeAsistencia: porcentaje,
          totalClases: datos.total,
          presentes: datos.presentes
        });
      } else if (porcentaje < 75) {
        this.estudiantesEnRiesgo.push({
          ...datos.estudiante,
          porcentajeAsistencia: porcentaje,
          totalClases: datos.total,
          presentes: datos.presentes
        });
      }
    });

    console.log('🚨 Estudiantes críticos:', this.estudiantesCriticos.length);
    console.log('⚠️ Estudiantes en riesgo:', this.estudiantesEnRiesgo.length);
  }

  aplicarFiltros(): void {
    let filtradas = [...this.asistencias];
    
    if (this.materiaSeleccionada) {
      filtradas = filtradas.filter(a => a.materiaId.toString() === this.materiaSeleccionada);
    }
    
    if (this.fechaInicio) {
      filtradas = filtradas.filter(a => a.fecha >= this.fechaInicio);
    }
    
    if (this.fechaFin) {
      filtradas = filtradas.filter(a => a.fecha <= this.fechaFin);
    }
    
    if (this.estadoFiltro) {
      filtradas = filtradas.filter(a => a.estado === this.estadoFiltro);
    }
    
    this.asistenciasFiltradas = filtradas;
  }

  editarAsistencia(asistencia: AsistenciaRegistro): void {
    this.asistenciaEditar = { ...asistencia };
    this.mostrarModalEditar = true;
  }

  guardarEdicion(): void {
    if (!this.asistenciaEditar) return;
    
    this.asistenciaService.updateAsistencia(
      this.asistenciaEditar.id,
      this.asistenciaEditar
    ).subscribe({
      next: () => {
        this.mensaje = 'Asistencia actualizada correctamente';
        this.cerrarModalEditar();
        this.cargarDatosIniciales();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al actualizar la asistencia';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  eliminarAsistencia(id: number): void {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;
    
    this.asistenciaService.deleteAsistencia(id).subscribe({
      next: () => {
        this.mensaje = 'Asistencia eliminada correctamente';
        this.cargarDatosIniciales();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al eliminar la asistencia';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.asistenciaEditar = null;
  }

  exportarCSV(): void {
    // Implementar exportación a CSV
    const csv = this.asistenciasFiltradas.map(a => 
      `${a.estudianteNombre},${a.materiaNombre},${a.fecha},${a.estado}`
    ).join('\n');
    
    const header = 'Estudiante,Materia,Fecha,Estado\n';
    const csvContent = header + csv;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Métodos para métricas estadísticas
  getColorAsistencia(porcentaje: number): string {
    if (porcentaje >= 80) return '#28a745'; // Verde
    if (porcentaje >= 60) return '#ffc107'; // Amarillo
    return '#dc3545'; // Rojo
  }

  getEstadoAsistencia(porcentaje: number): string {
    if (porcentaje >= 80) return 'Excelente';
    if (porcentaje >= 70) return 'Buena';
    if (porcentaje >= 60) return 'Regular';
    return 'Crítica';
  }

  getClaseMetrica(valor: number, tipo: 'criticos' | 'riesgo' | 'promedio'): string {
    if (tipo === 'criticos') {
      return valor > 0 ? 'metric-card-critica' : 'metric-card-excelente';
    }
    if (tipo === 'riesgo') {
      return valor > 0 ? 'metric-card-advertencia' : 'metric-card-buena';
    }
    if (tipo === 'promedio') {
      if (valor >= 85) return 'metric-card-excelente';
      if (valor >= 75) return 'metric-card-buena';
      if (valor >= 60) return 'metric-card-advertencia';
      return 'metric-card-critica';
    }
    return '';
  }

  // Getters para métricas
  get totalEstudiantesCriticos(): number {
    return this.estudiantesCriticos.length;
  }

  get totalEstudiantesEnRiesgo(): number {
    return this.estudiantesEnRiesgo.length;
  }

  get promedioFormateado(): string {
    return this.promedioAsistenciaGeneral.toFixed(1) + '%';
  }
}
