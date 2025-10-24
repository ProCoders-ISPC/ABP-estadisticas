
import { Component, OnInit, AfterViewInit, OnDestroy, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { InformesService, DistribucionArea, CargaAcademica, EstadisticasCarga, DistribucionMaterias, EstadisticasMaterias } from '../../../core/services/informes.service';
import { AsistenciaService } from '../../../core/services/asistencia.service';
import { MateriasService } from '../../../core/services/materias.service';
import { EstudiantesService } from '../../../core/services/estudiantes.service';
import { AlertasEstadisticasService, MetricasEstadisticas } from '../../../core/services/alertas-estadisticas.service';
import { GraficoBarrasComponent } from './grafico-barras';
import { GraficoPieComponent } from './grafico-pie';
import { AlertasRecomendacionesComponent } from './alertas-recomendaciones/alertas-recomendaciones';
import { BannerAlertasComponent } from '../../../shared/components/banner-alertas/banner-alertas';
import { FormatInterpretationPipe } from '../../../shared/pipes/format-interpretation.pipe';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-informes',
  standalone: true,
  templateUrl: './informes.html',
  styleUrls: ['./informes.css'],
  imports: [CommonModule, FormsModule, GraficoBarrasComponent, GraficoPieComponent, BannerAlertasComponent, FormatInterpretationPipe]
})
export class InformesComponent implements OnInit, AfterViewInit, OnDestroy {
  tipoInforme = 'distribucion-areas';
  informeGenerado = false;
  cargandoDatos = false;
  error = '';

  // Métricas estadísticas globales
  metricas: MetricasEstadisticas | null = null;
  interpretacionMetricas = '';
  alertasCount = 0;

  // Datos de docentes
  distribucionAreas: DistribucionArea[] = [];
  cargaAcademica: CargaAcademica[] = [];
  estadisticasCarga: EstadisticasCarga | null = null;

  // Datos de materias
  distribucionMaterias: DistribucionMaterias[] = [];
  estadisticasMaterias: EstadisticasMaterias | null = null;

  // Datos de estudiantes y asistencia
  estadisticasEstudiantes: any = null;
  distribucionEstudiantesPorArea: any[] = [];
  asistenciaSemanal: any[] = [];
  estudiantesConAsistencia: any[] = [];

  // Datos para gráficos
  datosGraficoAreas: any = null;
  datosGraficoCarga: any = null;
  datosGraficoMaterias: any = null;
  datosGraficoAsignacion: any = null;
  datosGraficoPieEstudiantes: any = null;
  datosGraficoAsistenciaSemanal: any = null;

  trackItem: TrackByFunction<DistribucionArea> | undefined;

  // Suscripciones para actualización en tiempo real
  private updateSubscription?: Subscription;
  private storageListener?: (e: StorageEvent) => void;

  constructor(
    private informesService: InformesService,
    private asistenciaService: AsistenciaService,
    private materiasService: MateriasService,
    private estudiantesService: EstudiantesService,
    private alertasEstadisticasService: AlertasEstadisticasService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    console.log('[InformesComponent] Inicializado. Cargando métricas globales...');
    this.cargarMetricasGlobales();
    this.generarInforme();
    this.configurarActualizacionTiempoReal();
  }

  /**
   * Cargar métricas estadísticas globales una sola vez
   */
  private cargarMetricasGlobales(): void {
    console.log('[InformesComponent] Pidiendo datos para métricas globales...');
    forkJoin({
      estudiantes: this.estudiantesService.getEstudiantes(),
      materias: this.materiasService.getMaterias(),
      docentes: this.materiasService.getDocentes(),
      asistencias: this.asistenciaService.getAllAsistencias()
    }).subscribe({
      next: ({ estudiantes, materias, docentes, asistencias }) => {
        console.log('[InformesComponent] Datos para métricas globales recibidos. Calculando...');
        this.alertasEstadisticasService.calcularMetricasYAlertas(
          estudiantes, materias, docentes, asistencias
        ).subscribe({
          next: ({ metricas, alertas }) => {
            this.metricas = metricas;
            this.alertasCount = alertas.length;
            this.interpretacionMetricas = this.alertasEstadisticasService.getInterpretacionMetricas(metricas);
            console.log('📊 Métricas globales cargadas:', metricas);
          },
          error: (error) => {
            console.error('[InformesComponent] Error calculando métricas globales:', error);
          }
        });
      },
      error: (error) => {
        console.error('[InformesComponent] Error cargando datos para métricas globales:', error);
      }
    });
  }

  seleccionarInforme(tipo: string): void {
    console.log(`[InformesComponent] Pestaña seleccionada: ${tipo}`);
    this.tipoInforme = tipo;
    
    // Limpiar datos previos para forzar recarga
    this.distribucionAreas = [];
    this.cargaAcademica = [];
    this.distribucionMaterias = [];
    this.estadisticasEstudiantes = null;
    this.distribucionEstudiantesPorArea = [];
    this.asistenciaSemanal = [];
    this.estudiantesConAsistencia = [];
    
    // Recargar métricas globales
    this.cargarMetricasGlobales();
    
    // Generar nuevo informe
    this.generarInforme();
  }

  generarInforme(): void {
    if (this.cargandoDatos) {
      console.log('[InformesComponent] Intento de generar informe mientras ya se está cargando uno. Cancelado.');
      return;
    }
    
    console.log(`[InformesComponent] Generando informe para: ${this.tipoInforme}`);
    this.cargandoDatos = true;
    this.error = '';
    this.informeGenerado = false;

    // Destruir gráficos dinámicos previos
    this.destruirGraficosDinamicos();

    if (this.tipoInforme === 'distribucion-areas') {
      this.generarInformeDistribucion();
    } else if (this.tipoInforme === 'carga-academica') {
      this.generarInformeCarga();
    } else if (this.tipoInforme === 'distribucion-materias') {
      this.generarInformeMaterias();
    } else if (this.tipoInforme === 'estudiantes-asistencia') {
      this.generarInformeEstudiantes();
    }

    // Actualizar gráficos dinámicos después de cambiar tipo de informe
    setTimeout(() => {
      if (this.tipoInforme === 'distribucion-areas') {
        this.generarGraficoRendimientoAreas();
      }
      if (this.tipoInforme === 'estudiantes-asistencia') {
        this.generarGraficoComparativaMensual();
      }
      if (this.tipoInforme === 'distribucion-materias') {
        this.generarGraficoVarianza();
      }
    }, 1500);
  }

  private generarInformeDistribucion(): void {
    this.informesService.getDistribucionPorArea().subscribe({
      next: (data) => {
        this.distribucionAreas = data;
        this.procesarDatosDistribucion();
        this.informeGenerado = true;
        this.cargandoDatos = false;
      },
      error: (err) => {
        console.error('Error al generar informe de distribución:', err);
        this.error = 'Error al cargar datos de distribución por área';
        this.cargandoDatos = false;
      }
    });
  }

  private generarInformeCarga(): void {
    Promise.all([
      this.informesService.getCargaAcademica().toPromise(),
      this.informesService.getEstadisticasCarga().toPromise()
    ]).then(([carga, estadisticas]) => {
      this.cargaAcademica = carga || [];
      this.estadisticasCarga = estadisticas || null;
      this.procesarDatosCarga();
      this.informeGenerado = true;
      this.cargandoDatos = false;
    }).catch((err) => {
      console.error('Error al generar informe de carga:', err);
      this.error = 'Error al cargar datos de carga académica';
      this.cargandoDatos = false;
    });
  }


  private generarInformeMaterias(): void {
    Promise.all([
      this.informesService.getDistribucionMaterias().toPromise(),
      this.informesService.getEstadisticasMaterias().toPromise()
    ]).then(([distribucion, estadisticas]) => {
      this.distribucionMaterias = distribucion || [];
      this.estadisticasMaterias = estadisticas || null;
      this.procesarDatosMaterias();
      this.informeGenerado = true;
      this.cargandoDatos = false;
    }).catch((err) => {
      console.error('Error al generar informe de materias:', err);
      this.error = 'Error al cargar datos de distribución de materias';
      this.cargandoDatos = false;
    });
  }

  private procesarDatosDistribucion(): void {
    console.log('[InformesComponent] procesarDatosDistribucion - distribucionAreas:', this.distribucionAreas);
    // Generar colores dinámicos basados en la cantidad de áreas
    const coloresDinamicos = this.generarColoresDinamicos(this.distribucionAreas.length);
    
    this.datosGraficoAreas = {
      tipo: 'barras',
      titulo: 'Distribución de Docentes por Área',
      etiquetas: this.distribucionAreas.map(item => item.area),
      datos: this.distribucionAreas.map(item => item.cantidad),
      colores: coloresDinamicos
    };
    console.log('[InformesComponent] procesarDatosDistribucion - datosGraficoAreas:', this.datosGraficoAreas);
  }

  private procesarDatosCarga(): void {
    const datosOrdenados = this.cargaAcademica
      .sort((a, b) => b.cantidadMaterias - a.cantidadMaterias)
      .slice(0, 15);
    
    // Generar colores dinámicos
    const coloresDinamicos = this.generarColoresDinamicos(datosOrdenados.length);

    this.datosGraficoCarga = {
      tipo: 'barras',
      titulo: 'Carga Académica por Docente (Top 15)',
      etiquetas: datosOrdenados.map(item => item.nombreDocente),
      datos: datosOrdenados.map(item => item.cantidadMaterias),
      colores: coloresDinamicos
    };
  }

 
  private procesarDatosMaterias(): void {
    // Generar colores dinámicos basados en la cantidad de áreas
    const coloresDinamicos = this.generarColoresDinamicos(this.distribucionMaterias.length);
  
    this.datosGraficoMaterias = {
      tipo: 'barras',
      titulo: 'Total de Materias por Área de Conocimiento',
      etiquetas: this.distribucionMaterias.map(item => item.area),
      datos: this.distribucionMaterias.map(item => item.totalMaterias),
      colores: coloresDinamicos
    };

   
    this.datosGraficoAsignacion = {
      tipo: 'barras-comparativas',
      titulo: 'Materias Asignadas vs Sin Asignar por Área',
      categorias: this.distribucionMaterias.map(item => item.area),
      series: [
        {
          nombre: 'Asignadas',
          datos: this.distribucionMaterias.map(item => item.materiasAsignadas),
          color: '#4CAF50'
        },
        {
          nombre: 'Sin Asignar',
          datos: this.distribucionMaterias.map(item => item.materiasSinAsignar),
          color: '#F44336'
        }
      ]
    };
  }

  getPromedioFormateado(): string {
    return this.estadisticasCarga?.promedio.toFixed(2) || '0';
  }

  getDesviacionFormateada(): string {
    return this.estadisticasCarga?.desviacionEstandar.toFixed(2) || '0';
  }

  getPorcentajeAsignacionFormateado(): string {
    return this.estadisticasMaterias?.porcentajeAsignacion.toFixed(1) || '0';
  }

  getInterpretacionDistribucion(): string {
    if (this.distribucionAreas.length === 0) return '';
    
    const areaMayorDistribucion = this.distribucionAreas
      .reduce((prev, current) => prev.cantidad > current.cantidad ? prev : current);
    
    const areaMenorDistribucion = this.distribucionAreas
      .reduce((prev, current) => prev.cantidad < current.cantidad ? prev : current);
    
    const totalDocentes = this.distribucionAreas.reduce((sum, area) => sum + area.cantidad, 0);
    const promedioDocentes = totalDocentes / this.distribucionAreas.length;
    
    // Calcular coeficiente de variación
    const varianza = this.distribucionAreas.reduce((sum, area) => 
      sum + Math.pow(area.cantidad - promedioDocentes, 2), 0) / this.distribucionAreas.length;
    const desviacionEstandar = Math.sqrt(varianza);
    const coeficienteVariacion = (desviacionEstandar / promedioDocentes) * 100;
    
    let interpretacion = `📊 **ANÁLISIS ESTADÍSTICO COMPLETO DE DISTRIBUCIÓN DOCENTE**\n\n`;
    
    interpretacion += `🔍 **TENDENCIA CENTRAL Y DISPERSIÓN:**\n`;
    interpretacion += `• **Área dominante:** ${areaMayorDistribucion.area} concentra el ${areaMayorDistribucion.porcentaje}% del cuerpo docente (${areaMayorDistribucion.cantidad} docentes)\n`;
    interpretacion += `• **Área con menor presencia:** ${areaMenorDistribucion.area} con ${areaMenorDistribucion.cantidad} docentes (${areaMenorDistribucion.porcentaje}%)\n`;
    interpretacion += `• **Brecha entre áreas:** ${areaMayorDistribucion.cantidad - areaMenorDistribucion.cantidad} docentes de diferencia\n`;
    interpretacion += `• **Promedio por área:** ${promedioDocentes.toFixed(1)} docentes\n\n`;
    
    interpretacion += `📈 **EVALUACIÓN DE EQUILIBRIO INSTITUCIONAL:**\n`;
    if (coeficienteVariacion < 30) {
      interpretacion += `• 🟢 **DISTRIBUCIÓN EQUILIBRADA** (CV: ${coeficienteVariacion.toFixed(1)}%): Las áreas mantienen una dotación docente relativamente uniforme\n`;
    } else if (coeficienteVariacion < 50) {
      interpretacion += `• 🟡 **DISTRIBUCIÓN MODERADAMENTE DESIGUAL** (CV: ${coeficienteVariacion.toFixed(1)}%): Existe cierta concentración que requiere monitoreo\n`;
    } else {
      interpretacion += `• 🔴 **DISTRIBUCIÓN ALTAMENTE DESIGUAL** (CV: ${coeficienteVariacion.toFixed(1)}%): Concentración crítica en pocas áreas\n`;
    }
    
    interpretacion += `\n💡 **IMPLICACIONES ESTRATÉGICAS:**\n`;
    interpretacion += `• **Especialización vs Diversidad:** ${areaMayorDistribucion.porcentaje > 40 ? 
      'Alta especialización en ' + areaMayorDistribucion.area + ' puede limitar interdisciplinariedad' :
      'Distribución favorece la diversidad académica y colaboración inter-área'}\n`;
    interpretacion += `• **Capacidad de Respuesta:** ${coeficienteVariacion > 40 ? 
      'Concentración docente puede generar cuellos de botella en áreas específicas' :
      'Distribución permite flexibilidad ante cambios de demanda académica'}\n`;
    interpretacion += `• **Desarrollo Institucional:** ${this.distribucionAreas.length > 5 ? 
      'Amplio espectro de áreas requiere gestión diferenciada por especialidad' :
      'Estructura compacta facilita coordinación y gestión unificada'}`;
    
    return interpretacion;
  }

  getInterpretacionCarga(): string {
    if (!this.estadisticasCarga) return '';
    
    const promedio = this.estadisticasCarga.promedio;
    const desviacion = this.estadisticasCarga.desviacionEstandar;
    const cv = this.estadisticasCarga.coeficienteVariacion;
    const rango = this.estadisticasCarga.rango;
    
    // Análisis de distribución
    const docentesSinCarga = this.cargaAcademica.filter(d => d.cantidadMaterias === 0).length;
    const docentesSobrecarga = this.cargaAcademica.filter(d => 
      d.cantidadMaterias > promedio + (2 * desviacion)).length;
    const docentesEquilibrados = this.cargaAcademica.length - docentesSinCarga - docentesSobrecarga;
    
    let interpretacion = `📊 **ANÁLISIS INTEGRAL DE CARGA ACADÉMICA**\n\n`;
    
    interpretacion += `🔍 **ESTADÍSTICAS DESCRIPTIVAS:**\n`;
    interpretacion += `• **Promedio institucional:** ${promedio.toFixed(2)} materias por docente\n`;
    interpretacion += `• **Rango de variación:** ${this.estadisticasCarga.minimo} - ${this.estadisticasCarga.maximo} materias (amplitud: ${rango})\n`;
    interpretacion += `• **Punto de equilibrio (mediana):** ${this.estadisticasCarga.mediana} materias\n`;
    interpretacion += `• **Carga más frecuente (moda):** ${this.estadisticasCarga.moda} materias\n\n`;
    
    interpretacion += `📈 **ANÁLISIS DE VARIABILIDAD:**\n`;
    interpretacion += `• **Desviación estándar:** ${desviacion.toFixed(2)} materias `;
    if (desviacion < 1.0) {
      interpretacion += `(🟢 **EXCELENTE** - Distribución muy homogénea)\n`;
    } else if (desviacion < 1.5) {
      interpretacion += `(🟡 **BUENA** - Ligera variabilidad controlada)\n`;
    } else if (desviacion < 2.0) {
      interpretacion += `(🟠 **REGULAR** - Variabilidad moderada que requiere atención)\n`;
    } else {
      interpretacion += `(🔴 **CRÍTICA** - Alta variabilidad requiere redistribución urgente)\n`;
    }
    
    interpretacion += `• **Coeficiente de variación:** ${cv.toFixed(1)}% `;
    if (cv < 20) {
      interpretacion += `(🟢 Baja dispersión relativa - distribución muy equilibrada)\n`;
    } else if (cv < 35) {
      interpretacion += `(🟡 Dispersión moderada - aceptable pero mejorable)\n`;
    } else {
      interpretacion += `(🔴 Alta dispersión relativa - requiere redistribución)\n`;
    }
    
    interpretacion += `\n👥 **SEGMENTACIÓN DEL CUERPO DOCENTE:**\n`;
    interpretacion += `• **Docentes sin carga:** ${docentesSinCarga} (${(docentesSinCarga/this.cargaAcademica.length*100).toFixed(1)}%) - Disponibles para asignaciones\n`;
    interpretacion += `• **Docentes con carga equilibrada:** ${docentesEquilibrados} (${(docentesEquilibrados/this.cargaAcademica.length*100).toFixed(1)}%) - Dentro del rango normal\n`;
    interpretacion += `• **Docentes con sobrecarga:** ${docentesSobrecarga} (${(docentesSobrecarga/this.cargaAcademica.length*100).toFixed(1)}%) - Requieren redistribución\n\n`;
    
    interpretacion += `⚖️ **EVALUACIÓN DE EQUIDAD:**\n`;
    const equidad = 100 - cv;
    interpretacion += `• **Índice de equidad:** ${equidad.toFixed(1)}% `;
    if (equidad > 80) {
      interpretacion += `(🏆 Distribución muy equitativa)\n`;
    } else if (equidad > 65) {
      interpretacion += `(🟢 Distribución aceptablemente equitativa)\n`;
    } else if (equidad > 50) {
      interpretacion += `(🟡 Distribución moderadamente inequitativa)\n`;
    } else {
      interpretacion += `(🔴 Distribución altamente inequitativa)\n`;
    }
    
    interpretacion += `\n💡 **RECOMENDACIONES ESTRATÉGICAS:**\n`;
    if (docentesSobrecarga > 0) {
      interpretacion += `• **Redistribución urgente:** Trasladar materias de ${docentesSobrecarga} docentes sobrecargados\n`;
    }
    if (docentesSinCarga > 0) {
      interpretacion += `• **Optimización de recursos:** Asignar materias a ${docentesSinCarga} docentes disponibles\n`;
    }
    if (cv > 30) {
      interpretacion += `• **Políticas de equidad:** Implementar límites máximos y mínimos de carga académica\n`;
    }
    interpretacion += `• **Monitoreo continuo:** Revisar distribución ${cv > 25 ? 'mensualmente' : 'trimestralmente'} para mantener equilibrio`;
    
    return interpretacion;
  }

 
  getInterpretacionMaterias(): string {
    if (!this.estadisticasMaterias || this.distribucionMaterias.length === 0) return '';
    
    const areaMayorSinAsignar = this.distribucionMaterias
      .reduce((prev, current) => prev.materiasSinAsignar > current.materiasSinAsignar ? prev : current);
    
    const areaMayorAsignacion = this.distribucionMaterias
      .reduce((prev, current) => prev.porcentajeAsignadas > current.porcentajeAsignadas ? prev : current);
    
    const areaMenorAsignacion = this.distribucionMaterias
      .reduce((prev, current) => prev.porcentajeAsignadas < current.porcentajeAsignadas ? prev : current);
    
    // Cálculos adicionales
    const promedioAsignacion = this.distribucionMaterias.reduce((sum, area) => 
      sum + area.porcentajeAsignadas, 0) / this.distribucionMaterias.length;
    
    const areasCompletas = this.distribucionMaterias.filter(area => area.porcentajeAsignadas === 100).length;
    const areasCriticas = this.distribucionMaterias.filter(area => area.porcentajeAsignadas < 70).length;
    
    let interpretacion = `📚 **ANÁLISIS INTEGRAL DE COBERTURA ACADÉMICA**\n\n`;
    
    interpretacion += `📊 **MÉTRICAS GENERALES DE COBERTURA:**\n`;
    interpretacion += `• **Cobertura institucional total:** ${this.estadisticasMaterias.porcentajeAsignacion.toFixed(1)}% (${this.estadisticasMaterias.totalAsignadas}/${this.estadisticasMaterias.totalMaterias} materias)\n`;
    interpretacion += `• **Materias pendientes de asignación:** ${this.estadisticasMaterias.totalSinAsignar} materias\n`;
    interpretacion += `• **Promedio de cobertura por área:** ${promedioAsignacion.toFixed(1)}%\n`;
    interpretacion += `• **Áreas académicas analizadas:** ${this.distribucionMaterias.length} áreas de conocimiento\n\n`;
    
    interpretacion += `🎯 **ESTADO DE COBERTURA INSTITUCIONAL:**\n`;
    if (this.estadisticasMaterias.porcentajeAsignacion > 95) {
      interpretacion += `• 🏆 **EXCELENTE** - Cobertura prácticamente completa, institución muy bien gestionada\n`;
    } else if (this.estadisticasMaterias.porcentajeAsignacion > 90) {
      interpretacion += `• 🟢 **MUY BUENA** - Cobertura alta, solo ajustes menores requeridos\n`;
    } else if (this.estadisticasMaterias.porcentajeAsignacion > 80) {
      interpretacion += `• 🟡 **BUENA** - Cobertura adecuada, algunas áreas requieren atención\n`;
    } else if (this.estadisticasMaterias.porcentajeAsignacion > 70) {
      interpretacion += `• 🟠 **REGULAR** - Cobertura insuficiente, requiere plan de mejora\n`;
    } else {
      interpretacion += `• 🔴 **CRÍTICA** - Cobertura deficiente, requiere acción inmediata\n`;
    }
    
    interpretacion += `\n📈 **ANÁLISIS POR ÁREA DE CONOCIMIENTO:**\n`;
    interpretacion += `• **Área con mejor cobertura:** ${areaMayorAsignacion.area} (${areaMayorAsignacion.porcentajeAsignadas.toFixed(1)}% - ${areaMayorAsignacion.materiasAsignadas}/${areaMayorAsignacion.totalMaterias} materias)\n`;
    interpretacion += `• **Área con mayor déficit:** ${areaMenorAsignacion.area} (${areaMenorAsignacion.porcentajeAsignadas.toFixed(1)}% - ${areaMenorAsignacion.materiasSinAsignar} materias sin asignar)\n`;
    interpretacion += `• **Área más crítica:** ${areaMayorSinAsignar.area} con ${areaMayorSinAsignar.materiasSinAsignar} materias sin docente\n`;
    interpretacion += `• **Brecha entre áreas:** ${(areaMayorAsignacion.porcentajeAsignadas - areaMenorAsignacion.porcentajeAsignadas).toFixed(1)} puntos porcentuales\n\n`;
    
    interpretacion += `🏷️ **CATEGORIZACIÓN DE ÁREAS:**\n`;
    interpretacion += `• **Áreas completamente cubiertas:** ${areasCompletas}/${this.distribucionMaterias.length} áreas (${(areasCompletas/this.distribucionMaterias.length*100).toFixed(1)}%)\n`;
    interpretacion += `• **Áreas en situación crítica (<70%):** ${areasCriticas}/${this.distribucionMaterias.length} áreas\n`;
    
    if (areasCriticas > 0) {
      const areasCriticasList = this.distribucionMaterias
        .filter(area => area.porcentajeAsignadas < 70)
        .map(area => `${area.area} (${area.porcentajeAsignadas.toFixed(1)}%)`);
      interpretacion += `  - ${areasCriticasList.join(', ')}\n`;
    }
    
    interpretacion += `\n⚖️ **ANÁLISIS DE EQUIDAD ENTRE ÁREAS:**\n`;
    const varianzaAsignacion = this.distribucionMaterias.reduce((sum, area) => 
      sum + Math.pow(area.porcentajeAsignadas - promedioAsignacion, 2), 0) / this.distribucionMaterias.length;
    const cvAsignacion = Math.sqrt(varianzaAsignacion) / promedioAsignacion * 100;
    
    interpretacion += `• **Coeficiente de variación entre áreas:** ${cvAsignacion.toFixed(1)}% `;
    if (cvAsignacion < 15) {
      interpretacion += `(🟢 Distribución muy equitativa)\n`;
    } else if (cvAsignacion < 25) {
      interpretacion += `(🟡 Distribución moderadamente equitativa)\n`;
    } else {
      interpretacion += `(🔴 Distribución inequitativa)\n`;
    }
    
    interpretacion += `\n💡 **RECOMENDACIONES ESTRATÉGICAS:**\n`;
    if (this.estadisticasMaterias.totalSinAsignar > 0) {
      interpretacion += `• **Priorización de contrataciones:** Enfocar en ${areaMayorSinAsignar.area} (${areaMayorSinAsignar.materiasSinAsignar} vacantes)\n`;
    }
    if (areasCriticas > 0) {
      interpretacion += `• **Plan de emergencia:** Atender ${areasCriticas} área(s) con cobertura crítica\n`;
    }
    if (cvAsignacion > 20) {
      interpretacion += `• **Redistribución estratégica:** Equilibrar cobertura entre áreas de conocimiento\n`;
    }
    interpretacion += `• **Meta institucional:** Alcanzar ${this.estadisticasMaterias.porcentajeAsignacion < 95 ? '95%' : '100%'} de cobertura global\n`;
    interpretacion += `• **Monitoreo:** Revisión ${this.estadisticasMaterias.totalSinAsignar > 10 ? 'semanal' : 'mensual'} del estado de asignaciones`;
    
    return interpretacion;
  }

  
  getMaxMaterias(): number {
    if (this.distribucionMaterias.length === 0) return 1;
    
    return Math.max(
      ...this.distribucionMaterias.map(area => 
        Math.max(area.materiasAsignadas, area.materiasSinAsignar)
      )
    );
  }

  // === MÉTODOS PARA ESTUDIANTES ===
  private generarInformeEstudiantes(): void {
    Promise.all([
      this.informesService.getEstadisticasEstudiantes().toPromise(),
      this.informesService.getDistribucionEstudiantesPorArea().toPromise(),
      this.informesService.getAsistenciaSemanal().toPromise(),
      this.informesService.getEstudiantesConAsistencia().toPromise()
    ]).then(([estadisticas, distribucion, asistenciaSemanal, estudiantesAsistencia]) => {
      this.estadisticasEstudiantes = estadisticas;
      this.distribucionEstudiantesPorArea = distribucion || [];
      this.asistenciaSemanal = asistenciaSemanal || [];
      this.estudiantesConAsistencia = estudiantesAsistencia || [];
      this.procesarDatosEstudiantes();
      this.informeGenerado = true;
      this.cargandoDatos = false;
    }).catch((err) => {
      console.error('Error al generar informe de estudiantes:', err);
      this.error = 'Error al cargar datos de estudiantes y asistencia';
      this.cargandoDatos = false;
    });
  }

  private procesarDatosEstudiantes(): void {
    // Gráfico de torta: Distribución de materias por área
    if (this.distribucionEstudiantesPorArea.length > 0) {
      this.datosGraficoPieEstudiantes = {
        titulo: 'Distribución de Materias por Área',
        datos: this.distribucionEstudiantesPorArea,
        colores: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B']
      };
    }

    // Gráfico de barras: Asistencia semanal
    if (this.asistenciaSemanal.length > 0) {
      this.datosGraficoAsistenciaSemanal = {
        tipo: 'barras',
        titulo: 'Evolución de Asistencia Semanal',
        etiquetas: this.asistenciaSemanal.map(item => item.semana),
        datos: this.asistenciaSemanal.map(item => item.porcentaje),
        colores: ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7']
      };
    }
  }

  getPromedioAsistenciaFormateado(): string {
    return this.estadisticasEstudiantes?.promedioAsistencia?.toFixed(2) || '0';
  }

  getPorcentajeActivosFormateado(): string {
    return this.estadisticasEstudiantes?.porcentajeActivos?.toFixed(1) || '0';
  }

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

  getColorFondoAsistencia(porcentaje: number): string {
    if (porcentaje >= 80) return 'rgba(40, 167, 69, 0.1)';
    if (porcentaje >= 60) return 'rgba(255, 193, 7, 0.1)';
    return 'rgba(220, 53, 69, 0.1)';
  }

  getIconoEstado(porcentaje: number): string {
    if (porcentaje >= 80) return 'fas fa-check-circle';
    if (porcentaje >= 70) return 'fas fa-check';
    if (porcentaje >= 60) return 'fas fa-exclamation-triangle';
    return 'fas fa-times-circle';
  }

  getEstudiantesCriticos(): number {
    return this.estudiantesConAsistencia.filter(e => e.porcentajeAsistencia < 60).length;
  }

  // === PROPIEDADES PARA NUEVOS GRÁFICOS DINÁMICOS ===
  chartRendimientoAreas: any = null;
  chartComparativaMensual: any = null;
  chartVarianza: any = null;
  
  // Datos calculados para gráficos dinámicos
  promediosAsistenciaPorArea: any[] = [];
  evolucionAsistenciaMensual: any[] = [];
  datosVarianza: any = null;

  ngAfterViewInit(): void {
    // Esperar a que se rendericen los elementos y actualizar gráficos
    setTimeout(() => {
      if (this.tipoInforme === 'distribucion-areas') {
        this.generarGraficoRendimientoAreas();
      }
      if (this.tipoInforme === 'estudiantes-asistencia') {
        this.generarGraficoComparativaMensual();
      }
      if (this.tipoInforme === 'distribucion-materias') {
        this.generarGraficoVarianza();
      }
    }, 1000);
  }

  // === CÁLCULOS DINÁMICOS ===
  private calcularPromediosAsistenciaPorArea(): void {
    this.asistenciaService.getAllAsistencias().subscribe((asistencias: any[]) => {
      this.materiasService.getMaterias().subscribe((materias: any[]) => {
        // Agrupar asistencias por área
        const areaStats: { [key: string]: { total: number, presentes: number } } = {};
        
        asistencias.forEach((asistencia: any) => {
          const materia = materias.find((m: any) => m.id === asistencia.id_materia);
          if (materia) {
            const area = materia.area || 'Sin Área';
            
            if (!areaStats[area]) {
              areaStats[area] = { total: 0, presentes: 0 };
            }
            
            areaStats[area].total += 1;
            if (asistencia.estado === 'PRESENTE') {
              areaStats[area].presentes += 1;
            }
          }
        });
        
        // Convertir a array para los gráficos
        this.promediosAsistenciaPorArea = Object.entries(areaStats).map(([area, stats]) => ({
          area,
          promedio: stats.total > 0 ? (stats.presentes / stats.total) * 100 : 0,
          totalRegistros: stats.total
        }));
      });
    });
  }

  private calcularEvolucionMensual(): void {
    console.log('[InformesComponent] calcularEvolucionMensual: Iniciando cálculo de evolución mensual de asistencia.');
    this.asistenciaService.getAllAsistencias().subscribe((asistencias: any[]) => {
      console.log('[InformesComponent] calcularEvolucionMensual: Asistencias obtenidas:', asistencias);

      const mesesData: { [key: string]: { total: number, presentes: number, tardanzas: number } } = {};
      
      asistencias.forEach((asistencia: any) => {
        const fecha = new Date(asistencia.fecha);
        const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`;
        
        if (!mesesData[mesKey]) {
          mesesData[mesKey] = { total: 0, presentes: 0, tardanzas: 0 };
        }
        
        mesesData[mesKey].total += 1;
        if (asistencia.estado === 'PRESENTE') {
          mesesData[mesKey].presentes += 1;
        } else if (asistencia.estado === 'TARDANZA') {
          mesesData[mesKey].tardanzas += 1;
        }
      });
      console.log('[InformesComponent] calcularEvolucionMensual: Datos agrupados por mes:', mesesData);
      
      // Obtener los últimos 6 meses
      const mesesOrdenados = Object.keys(mesesData).sort().slice(-6);
      console.log('[InformesComponent] calcularEvolucionMensual: Últimos 6 meses ordenados:', mesesOrdenados);
      
      this.evolucionAsistenciaMensual = mesesOrdenados.map(mesKey => {
        const datos = mesesData[mesKey];
        const [año, mes] = mesKey.split('-').map(Number);
        const nombreMes = new Date(año, mes, 1).toLocaleDateString('es', { month: 'long' });
        
        return {
          mes: nombreMes,
          porcentajePresentes: datos.total > 0 ? (datos.presentes / datos.total) * 100 : 0,
          porcentajeAusentes: datos.total > 0 ? ((datos.total - datos.presentes - datos.tardanzas) / datos.total) * 100 : 0,
          porcentajeTardanzas: datos.total > 0 ? (datos.tardanzas / datos.total) * 100 : 0,
          totalRegistros: datos.total
        };
      });
      console.log('[InformesComponent] calcularEvolucionMensual: Evolución mensual calculada:', this.evolucionAsistenciaMensual);
    });
  }

  private calcularVarianzaMaterias(): void {
    if (this.distribucionMaterias.length === 0) return;
    
    // Calcular varianza de asignación por área
    const asignadas = this.distribucionMaterias.map(area => area.materiasAsignadas);
    const sinAsignar = this.distribucionMaterias.map(area => area.materiasSinAsignar);
    
    const promedioAsignadas = asignadas.reduce((a, b) => a + b, 0) / asignadas.length;
    const promedioSinAsignar = sinAsignar.reduce((a, b) => a + b, 0) / sinAsignar.length;
    
    const varianzaAsignadas = asignadas.reduce((sum, val) => sum + Math.pow(val - promedioAsignadas, 2), 0) / asignadas.length;
    const varianzaSinAsignar = sinAsignar.reduce((sum, val) => sum + Math.pow(val - promedioSinAsignar, 2), 0) / sinAsignar.length;
    
    const desviacionAsignadas = Math.sqrt(varianzaAsignadas);
    const desviacionSinAsignar = Math.sqrt(varianzaSinAsignar);
    
    this.datosVarianza = {
      asignadas: {
        promedio: promedioAsignadas,
        varianza: varianzaAsignadas,
        desviacion: desviacionAsignadas
      },
      sinAsignar: {
        promedio: promedioSinAsignar,
        varianza: varianzaSinAsignar,
        desviacion: desviacionSinAsignar
      },
      coeficienteVariacion: {
        asignadas: promedioAsignadas > 0 ? (desviacionAsignadas / promedioAsignadas) * 100 : 0,
        sinAsignar: promedioSinAsignar > 0 ? (desviacionSinAsignar / promedioSinAsignar) * 100 : 0
      }
    };
  }

  // === GRÁFICOS DINÁMICOS ===
  generarGraficoRendimientoAreas(): void {
    console.log('[InformesComponent] generarGraficoRendimientoAreas: Iniciando generación de gráfico de rendimiento por áreas.');
    const ctx = document.getElementById('graficoRendimientoAreas') as HTMLCanvasElement;
    if (!ctx) {
      console.error('[InformesComponent] ❌ generarGraficoRendimientoAreas: No se encontró el elemento canvas con id "graficoRendimientoAreas".');
      return;
    }
    console.log('[InformesComponent] ✅ Canvas encontrado. Solicitando datos...');

    // Obtener docentes y agrupar por área, luego calcular asistencia
    this.materiasService.getDocentes().subscribe({
      next: (docentes: any[]) => {
        console.log('[InformesComponent] 👨‍🏫 Docentes obtenidos. Cantidad:', docentes.length);
        console.log('[InformesComponent] 📋 Docentes:', docentes);

        if (!docentes || docentes.length === 0) {
          console.warn('[InformesComponent] ⚠️ No hay docentes disponibles.');
          this.mostrarGraficoEjemploRendimiento(ctx);
          return;
        }

        // Agrupar docentes por área
        const areaDocentes: { [key: string]: number[] } = {};
        docentes.forEach((d: any) => {
          const area = d.area?.toUpperCase() || 'SIN ÁREA';
          if (!areaDocentes[area]) areaDocentes[area] = [];
          areaDocentes[area].push(d.id || d.id_usuario);
        });
        
        console.log('[InformesComponent] 📊 Docentes agrupados por área:', areaDocentes);

        // Obtener asistencias y calcular promedio por área
        this.asistenciaService.getAllAsistencias().subscribe({
          next: (asistencias: any[]) => {
            console.log('[InformesComponent] 📥 Asistencias obtenidas. Cantidad:', asistencias.length);

            const areaStats: { [key: string]: { total: number, presentes: number } } = {};
            
            // Inicializar todas las áreas
            Object.keys(areaDocentes).forEach(area => {
              areaStats[area] = { total: 0, presentes: 0 };
            });

            // Procesar asistencias
            asistencias.forEach((a: any) => {
              const docenteId = a.id_docente;
              let encontrada = false;
              
              for (const [area, docentes] of Object.entries(areaDocentes)) {
                if ((docentes as number[]).includes(docenteId)) {
                  areaStats[area].total += 1;
                  if (a.estado === 'PRESENTE') areaStats[area].presentes += 1;
                  encontrada = true;
                  break;
                }
              }
              
              if (!encontrada && asistencias.length > 0) {
                console.warn(`[InformesComponent] ⚠️ Asistencia sin mapeo a área. Docente: ${docenteId}`);
              }
            });

            console.log('[InformesComponent] ✅ Estadísticas de asistencia por área:', areaStats);

            const areas = Object.keys(areaStats);
            const promedios = areas.map(area => {
              const stats = areaStats[area];
              const promedio = stats.total > 0 ? (stats.presentes / stats.total) * 100 : 0;
              console.log(`[InformesComponent] 📊 Área "${area}": ${promedio.toFixed(2)}% (${stats.presentes}/${stats.total})`);
              return promedio;
            });

            if (areas.length === 0 || promedios.every(p => p === 0)) {
              console.warn('[InformesComponent] ⚠️ No hay datos de asistencia por área. Mostrando gráfico de ejemplo.');
              this.mostrarGraficoEjemploRendimiento(ctx);
              return;
            }

            const colores = [
              '#043237', '#0F8795', '#3abdcc', '#1a5f6f', '#2c8c9e', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B'
            ];

            if (this.chartRendimientoAreas) {
              console.log('[InformesComponent] 🗑️ Destruyendo gráfico anterior...');
              this.chartRendimientoAreas.destroy();
            }

            console.log('[InformesComponent] ✏️ Creando nuevo gráfico con datos reales.');
            this.chartRendimientoAreas = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: areas,
                datasets: [{
                  label: 'Promedio de Asistencia por Área (%)',
                  data: promedios,
                  backgroundColor: areas.map((_, idx) => colores[idx % colores.length]),
                  borderColor: areas.map((_, idx) => colores[idx % colores.length]),
                  borderWidth: 2,
                  borderRadius: 8
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Rendimiento de Asistencia por Área (Datos Reales)',
                    font: { size: 18, weight: 'bold' }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { weight: 'bold', size: 12 },
                    bodyFont: { size: 11 },
                    padding: 12,
                    cornerRadius: 6,
                    callbacks: {
                      title: (context: any) => context[0].label,
                      label: (context: any) => [`Asistencia: ${context.parsed.y.toFixed(1)}%`],
                      afterLabel: (context: any) => {
                        const area = areas[context.dataIndex];
                        const stats = areaStats[area];
                        return [
                          `Registros: ${stats.total}`,
                          `Presentes: ${stats.presentes}`,
                          `Ausentes: ${stats.total - stats.presentes}`
                        ];
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: function(value) { return value + '%'; } }
                  }
                }
              }
            });
            console.log('[InformesComponent] ✅ Gráfico "Rendimiento Académico por Área" renderizado exitosamente.');
          },
          error: (err) => {
            console.error('[InformesComponent] ❌ Error obteniendo asistencias:', err);
            this.mostrarGraficoEjemploRendimiento(ctx);
          }
        });
      },
      error: (err) => {
        console.error('[InformesComponent] ❌ Error obteniendo docentes:', err);
        this.mostrarGraficoEjemploRendimiento(ctx);
      }
    });
  }

  private mostrarGraficoEjemploRendimiento(ctx: HTMLCanvasElement): void {
    console.log('[InformesComponent] ⚠️ MOSTRANDO GRÁFICO DE EJEMPLO - No hay datos reales disponibles para Rendimiento Académico.');
    if (this.chartRendimientoAreas) {
      console.log('[InformesComponent] 🗑️ Destruyendo gráfico anterior...');
      this.chartRendimientoAreas.destroy();
    }
    
    console.log('[InformesComponent] 📝 Creando gráfico de ejemplo con datos hardcodeados.');
    this.chartRendimientoAreas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Exactas', 'Sociales', 'Naturales', 'Humanidades'],
        datasets: [{
          label: 'Promedio de Asistencia (%)',
          data: [78, 85, 72, 88],
          backgroundColor: ['#043237', '#0F8795', '#3abdcc', '#1a5f6f'],
          borderColor: ['#043237', '#0F8795', '#3abdcc', '#1a5f6f'],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Rendimiento de Asistencia por Área (Datos de Ejemplo)',
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: function(value) { return value + '%'; } }
          }
        }
      }
    });
  }

  generarGraficoComparativaMensual(): void {
    console.log('[InformesComponent] 🎯 INICIANDO: Gráfico de Comparativa Mensual.');
    const ctx = document.getElementById('graficoComparativaMensual') as HTMLCanvasElement;
    if (!ctx) {
      console.error('[InformesComponent] ❌ Canvas "graficoComparativaMensual" no encontrado en el DOM.');
      return;
    }
    console.log('[InformesComponent] ✅ Canvas encontrado. Iniciando cálculo de evolución mensual...');

    // Calcular datos dinámicos
    console.log('[InformesComponent] 🔄 Llamando a calcularEvolucionMensual()...');
    this.calcularEvolucionMensual();
    
    // Esperar un poco para que se procese la subscripción
    setTimeout(() => {
      console.log('[InformesComponent] ⏳ Verificando datos de evolución mensual...');
      console.log('[InformesComponent] 📊 evolucionAsistenciaMensual.length:', this.evolucionAsistenciaMensual.length);
      console.log('[InformesComponent] 📋 evolucionAsistenciaMensual:', this.evolucionAsistenciaMensual);
      
      if (this.evolucionAsistenciaMensual.length === 0) {
        console.warn('[InformesComponent] ⚠️ No hay datos de evolución mensual. Mostrando gráfico de ejemplo.');
        this.mostrarGraficoEjemploEvolucion(ctx);
        return;
      }

      // Destruir gráfico anterior si existe
      if (this.chartComparativaMensual) {
        console.log('[InformesComponent] 🗑️ Destruyendo gráfico anterior...');
        this.chartComparativaMensual.destroy();
      }
      
      console.log('[InformesComponent] ✏️ Creando nuevo gráfico de Chart.js con datos reales.');
      console.log('[InformesComponent] 📊 Datos para el gráfico: meses:', this.evolucionAsistenciaMensual.map(m => m.mes));
      
      this.chartComparativaMensual = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.evolucionAsistenciaMensual.map(mes => mes.mes),
        datasets: [
          {
            label: 'Presentes',
            data: this.evolucionAsistenciaMensual.map(mes => mes.porcentajePresentes),
            borderColor: '#043237',
            backgroundColor: 'rgba(4, 50, 55, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Ausentes',
            data: this.evolucionAsistenciaMensual.map(mes => mes.porcentajeAusentes),
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Tardanzas',
            data: this.evolucionAsistenciaMensual.map(mes => mes.porcentajeTardanzas),
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Evolución Mensual de Asistencia (Datos Reales)',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              afterLabel: (context: any) => {
                const index = context.dataIndex;
                const registros = this.evolucionAsistenciaMensual[index].totalRegistros;
                return `Total registros: ${registros}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
      });
      console.log('[InformesComponent] ✅ Gráfico "Comparativa de Asistencia Mensual" renderizado exitosamente.');
    }, 500); // Dar tiempo para que se procese la subscripción
  }

  private mostrarGraficoEjemploEvolucion(ctx: HTMLCanvasElement): void {
    console.log('[InformesComponent] ⚠️ MOSTRANDO GRÁFICO DE EJEMPLO - No hay datos reales disponibles para Comparativa Mensual.');
    if (this.chartComparativaMensual) {
      console.log('[InformesComponent] 🗑️ Destruyendo gráfico anterior...');
      this.chartComparativaMensual.destroy();
    }
    
    console.log('[InformesComponent] 📝 Creando gráfico de ejemplo con datos hardcodeados.');
    this.chartComparativaMensual = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Presentes',
            data: [85, 88, 82, 90, 87, 89],
            borderColor: '#043237',
            backgroundColor: 'rgba(4, 50, 55, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Ausentes',
            data: [10, 8, 12, 7, 9, 8],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Tardanzas',
            data: [5, 4, 6, 3, 4, 3],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: 'Evolución Mensual de Asistencia (Datos de Ejemplo)',
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: function(value) { return value + '%'; } }
          }
        }
      }
    });
  }

  // === NUEVO GRÁFICO DE VARIANZA ===
  generarGraficoVarianza(): void {
    const ctx = document.getElementById('graficoVarianza') as HTMLCanvasElement;
    if (!ctx) return;

    this.calcularVarianzaMaterias();
    
    if (!this.datosVarianza) return;

    // Destruir gráfico anterior si existe
    if (this.chartVarianza) {
      this.chartVarianza.destroy();
    }
    
    this.chartVarianza = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Promedio', 'Varianza', 'Desviación Estándar', 'Coef. Variación'],
        datasets: [
          {
            label: 'Materias Asignadas',
            data: [
              this.datosVarianza.asignadas.promedio,
              this.datosVarianza.asignadas.varianza,
              this.datosVarianza.asignadas.desviacion,
              this.datosVarianza.coeficienteVariacion.asignadas
            ],
            backgroundColor: 'rgba(4, 50, 55, 0.2)',
            borderColor: '#043237',
            pointBackgroundColor: '#043237',
            pointBorderColor: '#043237',
            borderWidth: 2
          },
          {
            label: 'Materias Sin Asignar',
            data: [
              this.datosVarianza.sinAsignar.promedio,
              this.datosVarianza.sinAsignar.varianza,
              this.datosVarianza.sinAsignar.desviacion,
              this.datosVarianza.coeficienteVariacion.sinAsignar
            ],
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            borderColor: '#dc3545',
            pointBackgroundColor: '#dc3545',
            pointBorderColor: '#dc3545',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Análisis de Varianza: Distribución de Materias',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              display: true
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    });
  }

  // === MÉTODOS AUXILIARES PARA VARIANZA ===
  getVarianzaFormateada(tipo: 'asignadas' | 'sinAsignar'): string {
    if (!this.datosVarianza) return '0.00';
    return this.datosVarianza[tipo].varianza.toFixed(2);
  }

  getDesviacionVarianzaFormateada(tipo: 'asignadas' | 'sinAsignar'): string {
    if (!this.datosVarianza) return '0.00';
    return this.datosVarianza[tipo].desviacion.toFixed(2);
  }

  getCoeficienteVariacionFormateado(tipo: 'asignadas' | 'sinAsignar'): string {
    if (!this.datosVarianza) return '0.0';
    return this.datosVarianza.coeficienteVariacion[tipo].toFixed(1) + '%';
  }

  // === MÉTODOS PARA INTERPRETACIÓN Y COLORES ===
  getClaseDesviacion(): string {
    if (!this.estadisticasCarga) return '';
    if (this.estadisticasCarga.desviacionEstandar < 1.0) return 'stat-card-excelente';
    if (this.estadisticasCarga.desviacionEstandar < 1.5) return 'stat-card-buena';
    if (this.estadisticasCarga.desviacionEstandar < 2.0) return 'stat-card-regular';
    return 'stat-card-critica';
  }

  getInterpretacionDesviacion(): string {
    if (!this.estadisticasCarga) return '';
    if (this.estadisticasCarga.desviacionEstandar < 1.0) return 'muy equilibrada';
    if (this.estadisticasCarga.desviacionEstandar < 1.5) return 'equilibrada';
    if (this.estadisticasCarga.desviacionEstandar < 2.0) return 'moderada';
    return 'alta variabilidad';
  }

  getClaseCV(): string {
    if (!this.estadisticasCarga) return '';
    if (this.estadisticasCarga.coeficienteVariacion < 20) return 'stat-card-excelente';
    if (this.estadisticasCarga.coeficienteVariacion < 30) return 'stat-card-buena';
    if (this.estadisticasCarga.coeficienteVariacion < 50) return 'stat-card-regular';
    return 'stat-card-critica';
  }

  getInterpretacionCV(): string {
    if (!this.estadisticasCarga) return '';
    if (this.estadisticasCarga.coeficienteVariacion < 20) return 'baja variabilidad';
    if (this.estadisticasCarga.coeficienteVariacion < 30) return 'variabilidad aceptable';
    if (this.estadisticasCarga.coeficienteVariacion < 50) return 'variabilidad moderada';
    return 'alta variabilidad';
  }

  getClaseInterpretacion(): string {
    if (!this.estadisticasCarga) return '';
    if (this.estadisticasCarga.desviacionEstandar < 1.0) return 'interpretation-excelente';
    if (this.estadisticasCarga.desviacionEstandar < 1.5) return 'interpretation-buena';
    if (this.estadisticasCarga.desviacionEstandar < 2.0) return 'interpretation-regular';
    return 'interpretation-critica';
  }

  getIconoInterpretacion(): string {
    if (!this.estadisticasCarga) return 'fas fa-info-circle';
    if (this.estadisticasCarga.desviacionEstandar < 1.0) return 'fas fa-check-circle';
    if (this.estadisticasCarga.desviacionEstandar < 1.5) return 'fas fa-thumbs-up';
    if (this.estadisticasCarga.desviacionEstandar < 2.0) return 'fas fa-exclamation-triangle';
    return 'fas fa-exclamation-circle';
  }

  /**
   * Genera una paleta de colores dinámica basada en HSL
   * para adaptarse a cualquier cantidad de categorías
   */
  private generarColoresDinamicos(cantidad: number): string[] {
    const colores: string[] = [];
    const saturacion = 70; // Saturación consistente
    const luminosidad = 50; // Luminosidad consistente
    
    for (let i = 0; i < cantidad; i++) {
      // Distribuir los colores uniformemente en el espectro (0-360 grados)
      const hue = Math.floor((360 / cantidad) * i);
      colores.push(`hsl(${hue}, ${saturacion}%, ${luminosidad}%)`);
    }
    
    return colores;
  }

  // === MÉTODOS PARA TOOLTIPS MEJORADOS ===
  getTooltipPromedio(): string {
    if (!this.estadisticasCarga) return '';
    const promedio = this.getPromedioFormateado();
    return `📊 PROMEDIO ARITMÉTICO: ${promedio} materias por docente
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• El promedio representa la tendencia central de la distribución
• Se calcula sumando todas las cargas y dividiendo por el número de docentes
• Útil para identificar la carga académica "típica" en la institución

📈 CONTEXTO ACTUAL:
• Con ${promedio} materias promedio, ${this.estadisticasCarga.promedio < 2 ? 'la carga es baja y equilibrada' : this.estadisticasCarga.promedio < 4 ? 'la carga es moderada' : 'la carga es alta'}
• ${this.cargaAcademica.length} docentes analizados en total

💡 UTILIDAD PRÁCTICA:
Permite evaluar si la distribución de materias es equitativa y planificar ajustes en asignaciones futuras.`;
  }

  getTooltipMediana(): string {
    if (!this.estadisticasCarga) return '';
    return `📊 MEDIANA: ${this.estadisticasCarga.mediana} materias
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• La mediana es el valor que divide la distribución en dos mitades iguales
• 50% de los docentes tiene ${this.estadisticasCarga.mediana} materias o menos
• 50% de los docentes tiene ${this.estadisticasCarga.mediana} materias o más
• Menos sensible a valores extremos que el promedio

📈 COMPARACIÓN CON EL PROMEDIO:
• Promedio: ${this.getPromedioFormateado()} | Mediana: ${this.estadisticasCarga.mediana}
• ${Number(this.getPromedioFormateado()) > this.estadisticasCarga.mediana ? 
    'La distribución tiene asimetría positiva (algunos docentes con muchas materias)' : 
    Number(this.getPromedioFormateado()) < this.estadisticasCarga.mediana ?
    'La distribución tiene asimetría negativa (concentración en valores altos)' :
    'La distribución es simétrica (equilibrada)'}

💡 UTILIDAD PRÁCTICA:
Identifica el punto medio real de la distribución, útil para establecer cargas "normales" de referencia.`;
  }

  getTooltipModa(): string {
    if (!this.estadisticasCarga) return '';
    const totalConModa = this.cargaAcademica.filter(d => d.cantidadMaterias === this.estadisticasCarga!.moda).length;
    return `📊 MODA: ${this.estadisticasCarga.moda} materias
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• La moda es el valor más frecuente en la distribución
• ${totalConModa} docentes tienen exactamente ${this.estadisticasCarga.moda} materias
• Representa la carga académica más común en la institución

📈 ANÁLISIS DE FRECUENCIA:
• ${totalConModa} de ${this.cargaAcademica.length} docentes (${(totalConModa/this.cargaAcademica.length*100).toFixed(1)}%) tienen esta carga
• ${this.estadisticasCarga.moda === 0 ? 
    'Muchos docentes sin materias asignadas - puede indicar docentes nuevos o en otras funciones' :
    `La mayoría maneja una carga de ${this.estadisticasCarga.moda} materias, lo que es ${this.estadisticasCarga.moda < 3 ? 'ligero' : this.estadisticasCarga.moda < 5 ? 'moderado' : 'alto'}`}

💡 UTILIDAD PRÁCTICA:
Identifica el patrón más común de asignación, útil para establecer estándares institucionales.`;
  }

  getTooltipMaximo(): string {
    if (!this.estadisticasCarga) return '';
    const docenteMaximo = this.cargaAcademica.find(d => d.cantidadMaterias === this.estadisticasCarga!.maximo);
    return `📊 VALOR MÁXIMO: ${this.estadisticasCarga.maximo} materias
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• Representa la carga académica más alta registrada
• Define el límite superior de la distribución
• Identifica posibles casos de sobrecarga académica

👤 ANÁLISIS DEL CASO:
• Docente con mayor carga: ${docenteMaximo?.nombreDocente || 'No identificado'}
• Diferencia con el promedio: +${(this.estadisticasCarga.maximo - this.estadisticasCarga.promedio).toFixed(1)} materias
• ${this.estadisticasCarga.maximo > this.estadisticasCarga.promedio + (2 * this.estadisticasCarga.desviacionEstandar) ? 
    '⚠️ ALERTA: Posible sobrecarga (>2 desviaciones del promedio)' : 
    '✓ Dentro del rango normal esperado'}

💡 UTILIDAD PRÁCTICA:
Permite identificar casos de sobrecarga para redistribuir materias y mejorar el equilibrio institucional.`;
  }

  getTooltipMinimo(): string {
    if (!this.estadisticasCarga) return '';
    const docenteMinimo = this.cargaAcademica.find(d => d.cantidadMaterias === this.estadisticasCarga!.minimo);
    return `📊 VALOR MÍNIMO: ${this.estadisticasCarga.minimo} materias
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• Representa la carga académica más baja registrada
• Define el límite inferior de la distribución
• Identifica posibles casos de subcarga o disponibilidad

👤 ANÁLISIS DEL CASO:
• Docente con menor carga: ${docenteMinimo?.nombreDocente || 'No identificado'}
• Diferencia con el promedio: -${(this.estadisticasCarga.promedio - this.estadisticasCarga.minimo).toFixed(1)} materias
• ${this.estadisticasCarga.minimo === 0 ? 
    'Sin materias asignadas - puede ser docente nuevo, administrativo o con licencia' : 
    `Carga reducida - posible disponibilidad para asignaciones adicionales`}

💡 UTILIDAD PRÁCTICA:
Identifica oportunidades de redistribución y docentes con disponibilidad para nuevas asignaciones.`;
  }

  getTooltipDesviacion(): string {
    if (!this.estadisticasCarga) return '';
    const desv = Number(this.getDesviacionFormateada());
    return `📊 DESVIACIÓN ESTÁNDAR: ${this.getDesviacionFormateada()} materias
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• Mide la dispersión o variabilidad de las cargas respecto al promedio
• Indica qué tan "dispersos" están los valores
• Se expresa en las mismas unidades que los datos originales

📈 ANÁLISIS DE VARIABILIDAD:
• ${desv < 1.0 ? '🟢 EXCELENTE: Distribución muy equilibrada' :
    desv < 1.5 ? '🟡 BUENA: Distribución equilibrada con ligeras variaciones' :
    desv < 2.0 ? '🟠 REGULAR: Variabilidad moderada, requiere atención' :
    '🔴 CRÍTICA: Alta variabilidad, redistribución urgente necesaria'}

📊 RANGO DE NORMALIDAD:
• 68% de los docentes: ${(this.estadisticasCarga.promedio - desv).toFixed(1)} - ${(this.estadisticasCarga.promedio + desv).toFixed(1)} materias
• 95% de los docentes: ${Math.max(0, this.estadisticasCarga.promedio - 2*desv).toFixed(1)} - ${(this.estadisticasCarga.promedio + 2*desv).toFixed(1)} materias

💡 UTILIDAD PRÁCTICA:
Evalúa la equidad en la distribución de cargas y la necesidad de redistribución académica.`;
  }

  getTooltipVarianza(): string {
    if (!this.estadisticasCarga) return '';
    return `📊 VARIANZA: ${this.estadisticasCarga.varianza.toFixed(2)} materias²
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• Es el promedio de las diferencias al cuadrado respecto a la media
• Se expresa en unidades cuadradas (materias²)
• Su raíz cuadrada es la desviación estándar (${this.getDesviacionFormateada()})

📈 ANÁLISIS MATEMÁTICO:
• Varianza = Σ(xi - μ)² / n
• Mayor varianza = Mayor dispersión en las cargas
• Útil para comparaciones estadísticas y cálculos avanzados

🔢 INTERPRETACIÓN PRÁCTICA:
• ${this.estadisticasCarga.varianza < 1.0 ? 
    'Baja varianza: Las cargas son muy similares entre docentes' :
    this.estadisticasCarga.varianza < 2.25 ? 
    'Varianza moderada: Algunas diferencias en cargas, pero controlables' :
    'Alta varianza: Grandes diferencias en cargas, requiere redistribución'}

💡 UTILIDAD PRÁCTICA:
Base matemática para análisis estadísticos avanzados y comparaciones temporales.`;
  }

  getTooltipCoeficienteVariacion(): string {
    if (!this.estadisticasCarga) return '';
    const cv = this.estadisticasCarga.coeficienteVariacion;
    return `📊 COEFICIENTE DE VARIACIÓN: ${cv.toFixed(1)}%
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• Medida relativa de dispersión (Desviación / Promedio × 100)
• Permite comparar variabilidad entre diferentes distribuciones
• Independiente de las unidades de medida

📈 CLASIFICACIÓN ESTADÍSTICA:
• ${cv < 15 ? '🟢 BAJA VARIABILIDAD (<15%): Distribución muy homogénea' :
    cv < 25 ? '🟡 VARIABILIDAD MODERADA (15-25%): Distribución aceptable' :
    cv < 35 ? '🟠 VARIABILIDAD ALTA (25-35%): Requiere atención' :
    '🔴 VARIABILIDAD MUY ALTA (>35%): Redistribución urgente'}

📊 CONTEXTO COMPARATIVO:
• En instituciones educativas, un CV < 30% se considera aceptable
• Su institución: ${cv.toFixed(1)}% - ${cv < 30 ? 'Dentro del rango aceptable' : 'Requiere mejoras'}

💡 UTILIDAD PRÁCTICA:
Estándar internacional para evaluar equidad en distribución de cargas académicas.`;
  }

  getTooltipRango(): string {
    if (!this.estadisticasCarga) return '';
    return `📊 RANGO: ${this.estadisticasCarga.rango} materias
    
🔍 INTERPRETACIÓN ESTADÍSTICA:
• Diferencia entre el valor máximo y mínimo
• Rango = Máximo (${this.estadisticasCarga.maximo}) - Mínimo (${this.estadisticasCarga.minimo})
• Medida simple de dispersión total

📈 ANÁLISIS DE AMPLITUD:
• ${this.estadisticasCarga.rango < 3 ? 
    '🟢 RANGO PEQUEÑO: Diferencias mínimas entre docentes' :
    this.estadisticasCarga.rango < 6 ? 
    '🟡 RANGO MODERADO: Algunas diferencias significativas' :
    '🔴 RANGO AMPLIO: Grandes desigualdades en la distribución'}

📊 PERSPECTIVA PRÁCTICA:
• Brecha máxima entre docentes: ${this.estadisticasCarga.rango} materias
• Equivale a ${(this.estadisticasCarga.rango / this.estadisticasCarga.promedio * 100).toFixed(0)}% del promedio institucional

💡 UTILIDAD PRÁCTICA:
Identifica la magnitud total de las desigualdades para planificar redistribuciones efectivas.`;
  }

  // === TOOLTIPS PARA SECCIÓN DE MATERIAS ===
  getTooltipTotalMaterias(): string {
    if (!this.estadisticasMaterias) return '';
    return `📚 TOTAL DE MATERIAS: ${this.estadisticasMaterias.totalMaterias} materias registradas
    
🔍 DEFINICIÓN:
• Inventario completo de materias académicas en el sistema
• Incluye todas las materias independientemente de su estado de asignación
• Base para calcular porcentajes de cobertura académica

📊 DISTRIBUCIÓN ACTUAL:
• Asignadas: ${this.estadisticasMaterias.totalAsignadas} (${this.getPorcentajeAsignacionFormateado()}%)
• Sin asignar: ${this.estadisticasMaterias.totalSinAsignar} (${(100 - this.estadisticasMaterias.porcentajeAsignacion).toFixed(1)}%)

📈 ANÁLISIS INSTITUCIONAL:
• ${this.distribucionMaterias.length} áreas de conocimiento diferentes
• Promedio de ${(this.estadisticasMaterias.totalMaterias / this.distribucionMaterias.length).toFixed(1)} materias por área

💡 UTILIDAD PRÁCTICA:
Permite evaluar la cobertura académica total y planificar la capacidad docente necesaria.`;
  }

  getTooltipMateriasAsignadas(): string {
    if (!this.estadisticasMaterias) return '';
    return `✅ MATERIAS ASIGNADAS: ${this.estadisticasMaterias.totalAsignadas} materias
    
🔍 DEFINICIÓN:
• Materias que actualmente tienen un docente responsable asignado
• Garantizan la continuidad académica y cobertura educativa
• Indicador de eficiencia en la gestión de recursos humanos

📊 COBERTURA ACADÉMICA:
• ${this.getPorcentajeAsignacionFormateado()}% del total de materias cubiertas
• ${this.estadisticasMaterias.porcentajeAsignacion > 90 ? '🟢 EXCELENTE: Cobertura muy alta' :
    this.estadisticasMaterias.porcentajeAsignacion > 80 ? '🟡 BUENA: Cobertura adecuada' :
    this.estadisticasMaterias.porcentajeAsignacion > 70 ? '🟠 REGULAR: Necesita mejoras' :
    '🔴 CRÍTICA: Cobertura insuficiente'}

📈 DISTRIBUCIÓN POR ÁREA:
${this.distribucionMaterias.slice(0, 3).map(area => 
  `• ${area.area}: ${area.materiasAsignadas}/${area.totalMaterias} (${area.porcentajeAsignadas.toFixed(1)}%)`
).join('\n')}

💡 UTILIDAD PRÁCTICA:
Monitorea la efectividad de las asignaciones y garantiza la cobertura académica institucional.`;
  }

  getTooltipMateriasSinAsignar(): string {
    if (!this.estadisticasMaterias) return '';
    return `⚠️ MATERIAS SIN ASIGNAR: ${this.estadisticasMaterias.totalSinAsignar} materias
    
🔍 DEFINICIÓN:
• Materias que no tienen docente responsable asignado
• Representan brechas en la cobertura académica
• Requieren atención prioritaria para asignación

📊 IMPACTO ACADÉMICO:
• ${(100 - this.estadisticasMaterias.porcentajeAsignacion).toFixed(1)}% de materias descubiertas
• ${this.estadisticasMaterias.totalSinAsignar > 10 ? '🔴 ALTO RIESGO: Muchas materias sin cubrir' :
    this.estadisticasMaterias.totalSinAsignar > 5 ? '🟠 RIESGO MODERADO: Varias materias sin asignar' :
    this.estadisticasMaterias.totalSinAsignar > 0 ? '🟡 RIESGO BAJO: Pocas materias sin asignar' :
    '🟢 SIN RIESGO: Todas las materias asignadas'}

📈 ÁREAS MÁS AFECTADAS:
${this.distribucionMaterias
  .filter(area => area.materiasSinAsignar > 0)
  .sort((a, b) => b.materiasSinAsignar - a.materiasSinAsignar)
  .slice(0, 3)
  .map(area => `• ${area.area}: ${area.materiasSinAsignar} materias sin asignar`)
  .join('\n')}

💡 UTILIDAD PRÁCTICA:
Identifica prioridades de contratación y redistribución de personal docente.`;
  }

  getTooltipPorcentajeAsignacion(): string {
    if (!this.estadisticasMaterias) return '';
    return `📊 PORCENTAJE DE ASIGNACIÓN: ${this.getPorcentajeAsignacionFormateado()}%
    
🔍 DEFINICIÓN:
• Indica qué porcentaje de materias tienen docente asignado
• Métrica clave de eficiencia en gestión académica
• Fórmula: (Materias Asignadas / Total Materias) × 100

📈 EVALUACIÓN INSTITUCIONAL:
• ${this.estadisticasMaterias.porcentajeAsignacion > 95 ? '🏆 EXCELENTE (>95%): Cobertura prácticamente completa' :
    this.estadisticasMaterias.porcentajeAsignacion > 90 ? '🟢 MUY BUENA (90-95%): Cobertura muy alta' :
    this.estadisticasMaterias.porcentajeAsignacion > 85 ? '🟡 BUENA (85-90%): Cobertura adecuada' :
    this.estadisticasMaterias.porcentajeAsignacion > 75 ? '🟠 REGULAR (75-85%): Necesita mejoras' :
    '🔴 CRÍTICA (<75%): Requiere acción inmediata'}

📊 COMPARATIVO CON ESTÁNDARES:
• Estándar recomendado: >90%
• Su institución: ${this.getPorcentajeAsignacionFormateado()}%
• Brecha: ${this.estadisticasMaterias.porcentajeAsignacion < 90 ? (90 - this.estadisticasMaterias.porcentajeAsignacion).toFixed(1) + '% por mejorar' : 'Supera el estándar'}

💡 UTILIDAD PRÁCTICA:
KPI principal para evaluar la gestión académica y planificar recursos docentes.`;
  }

  // === TOOLTIPS PARA SECCIÓN DE ESTUDIANTES ===
  getTooltipTotalEstudiantes(): string {
    if (!this.estadisticasEstudiantes) return '';
    return `👥 TOTAL DE ESTUDIANTES: ${this.estadisticasEstudiantes.totalEstudiantes} estudiantes registrados
    
🔍 DEFINICIÓN:
• Matrícula total de estudiantes en la plataforma
• Incluye estudiantes activos e inactivos
• Base poblacional para todos los análisis académicos

📊 COMPOSICIÓN ACTUAL:
• Activos: ${this.estadisticasEstudiantes.estudiantesActivos} (${this.getPorcentajeActivosFormateado()}%)
• Inactivos: ${this.estadisticasEstudiantes.totalEstudiantes - this.estadisticasEstudiantes.estudiantesActivos} (${(100 - this.estadisticasEstudiantes.porcentajeActivos).toFixed(1)}%)

📈 INDICADORES DE SALUD:
• ${this.estadisticasEstudiantes.porcentajeActivos > 90 ? '🟢 EXCELENTE: Alta participación estudiantil' :
    this.estadisticasEstudiantes.porcentajeActivos > 80 ? '🟡 BUENA: Participación adecuada' :
    this.estadisticasEstudiantes.porcentajeActivos > 70 ? '🟠 REGULAR: Necesita estrategias de retención' :
    '🔴 CRÍTICA: Alto riesgo de deserción'}

💡 UTILIDAD PRÁCTICA:
Dimensiona la comunidad estudiantil para planificar recursos y servicios educativos.`;
  }

  getTooltipEstudiantesActivos(): string {
    if (!this.estadisticasEstudiantes) return '';
    return `✅ ESTUDIANTES ACTIVOS: ${this.estadisticasEstudiantes.estudiantesActivos} estudiantes
    
🔍 DEFINICIÓN:
• Estudiantes que han mostrado actividad reciente en la plataforma
• Participan activamente en el proceso educativo
• Indicador de engagement y retención estudiantil

📊 NIVEL DE PARTICIPACIÓN:
• ${this.getPorcentajeActivosFormateado()}% de participación activa
• Promedio de asistencia: ${this.getPromedioAsistenciaFormateado()}%
• ${this.estadisticasEstudiantes.porcentajeActivos > 85 ? 'Participación muy alta' :
    this.estadisticasEstudiantes.porcentajeActivos > 75 ? 'Participación adecuada' :
    'Participación por debajo del esperado'}

📈 ANÁLISIS DE TENDENCIAS:
• Estudiantes comprometidos con su formación
• Base activa para análisis de rendimiento académico
• Población objetivo para estrategias educativas

💡 UTILIDAD PRÁCTICA:
Mide el compromiso estudiantil y la efectividad de las estrategias de retención.`;
  }

  getTooltipPromedioAsistencia(): string {
    if (!this.estadisticasEstudiantes) return '';
    return `📊 PROMEDIO DE ASISTENCIA: ${this.getPromedioAsistenciaFormateado()}%
    
🔍 DEFINICIÓN:
• Porcentaje promedio de asistencia de todos los estudiantes
• Calculado sobre todos los registros de asistencia
• Indicador clave de engagement académico

📈 EVALUACIÓN DEL RENDIMIENTO:
• ${this.estadisticasEstudiantes.promedioAsistencia > 90 ? '🏆 EXCELENTE (>90%): Compromiso excepcional' :
    this.estadisticasEstudiantes.promedioAsistencia > 80 ? '🟢 MUY BUENA (80-90%): Buen nivel de asistencia' :
    this.estadisticasEstudiantes.promedioAsistencia > 70 ? '🟡 ACEPTABLE (70-80%): Nivel estándar' :
    this.estadisticasEstudiantes.promedioAsistencia > 60 ? '🟠 REGULAR (60-70%): Necesita mejoras' :
    '🔴 CRÍTICA (<60%): Requiere intervención inmediata'}

📊 IMPACTO ACADÉMICO:
• Correlación directa con rendimiento académico
• Predictor de éxito en evaluaciones
• Indicador de clima institucional

💡 UTILIDAD PRÁCTICA:
Permite evaluar la efectividad de las clases y desarrollar estrategias de mejora del engagement.`;
  }

  getTooltipEstudiantesInactivos(): string {
    if (!this.estadisticasEstudiantes) return '';
    return `⚠️ ESTUDIANTES INACTIVOS: ${this.estadisticasEstudiantes.totalEstudiantes - this.estadisticasEstudiantes.estudiantesActivos} estudiantes
    
🔍 DEFINICIÓN:
• Estudiantes que no han mostrado actividad reciente
• En riesgo de deserción o abandono académico
• Requieren seguimiento y estrategias de reactivación

📊 ANÁLISIS DE RIESGO:
• ${(100 - this.estadisticasEstudiantes.porcentajeActivos).toFixed(1)}% de la población estudiantil
• ${this.estadisticasEstudiantes.porcentajeActivos < 70 ? '🔴 ALTO RIESGO: Muchos estudiantes inactivos' :
    this.estadisticasEstudiantes.porcentajeActivos < 85 ? '🟠 RIESGO MODERADO: Algunos estudiantes en riesgo' :
    '🟡 RIESGO BAJO: Pocos estudiantes inactivos'}

📈 ACCIONES RECOMENDADAS:
• Programa de seguimiento personalizado
• Estrategias de reenganche académico
• Análisis de causas de inactividad

💡 UTILIDAD PRÁCTICA:
Identifica estudiantes en riesgo para implementar estrategias de retención temprana.`;
  }

  // === MÉTODO DE INTERPRETACIÓN PARA ESTUDIANTES ===
  getInterpretacionEstudiantes(): string {
    if (!this.estadisticasEstudiantes) return '';
    
    const totalEstudiantes = this.estadisticasEstudiantes.totalEstudiantes;
    const estudiantesActivos = this.estadisticasEstudiantes.estudiantesActivos;
    const estudiantesInactivos = this.estadisticasEstudiantes.estudiantesInactivos;
    const promedioAsistencia = this.estadisticasEstudiantes.promedioAsistencia;
    const porcentajeActivos = this.estadisticasEstudiantes.porcentajeActivos;
    
    const estudiantesCriticos = this.getEstudiantesCriticos();
    const estudiantesExcelentes = this.estudiantesConAsistencia.filter(e => e.porcentajeAsistencia >= 90).length;
    const estudiantesBuenos = this.estudiantesConAsistencia.filter(e => e.porcentajeAsistencia >= 80 && e.porcentajeAsistencia < 90).length;
    const estudiantesRegulares = this.estudiantesConAsistencia.filter(e => e.porcentajeAsistencia >= 60 && e.porcentajeAsistencia < 80).length;
    
    let interpretacion = `👥 **ANÁLISIS INTEGRAL DE ENGAGEMENT ESTUDIANTIL**\n\n`;
    
    interpretacion += `📊 **PANORAMA GENERAL DE LA POBLACIÓN:**\n`;
    interpretacion += `• **Matrícula total:** ${totalEstudiantes} estudiantes registrados\n`;
    interpretacion += `• **Tasa de actividad:** ${porcentajeActivos.toFixed(1)}% (${estudiantesActivos} estudiantes activos)\n`;
    interpretacion += `• **Estudiantes inactivos:** ${estudiantesInactivos} (${(100 - porcentajeActivos).toFixed(1)}%) - Requieren seguimiento\n`;
    interpretacion += `• **Promedio institucional de asistencia:** ${promedioAsistencia.toFixed(2)}%\n\n`;
    
    interpretacion += `🎯 **EVALUACIÓN DEL COMPROMISO ACADÉMICO:**\n`;
    if (porcentajeActivos > 90) {
      interpretacion += `• 🏆 **EXCELENTE PARTICIPACIÓN** - Muy alta tasa de estudiantes activos\n`;
    } else if (porcentajeActivos > 80) {
      interpretacion += `• 🟢 **BUENA PARTICIPACIÓN** - Tasa de actividad adecuada\n`;
    } else if (porcentajeActivos > 70) {
      interpretacion += `• 🟡 **PARTICIPACIÓN REGULAR** - Necesita estrategias de engagement\n`;
    } else {
      interpretacion += `• 🔴 **PARTICIPACIÓN CRÍTICA** - Requiere intervención inmediata\n`;
    }
    
    if (promedioAsistencia >= 85) {
      interpretacion += `• 🎓 **ASISTENCIA EXCEPCIONAL** - Indica alto compromiso con el proceso educativo\n`;
    } else if (promedioAsistencia >= 75) {
      interpretacion += `• ✅ **ASISTENCIA SATISFACTORIA** - Nivel aceptable de compromiso estudiantil\n`;
    } else if (promedioAsistencia >= 65) {
      interpretacion += `• ⚠️ **ASISTENCIA REGULAR** - Requiere estrategias de motivación\n`;
    } else {
      interpretacion += `• 🚨 **ASISTENCIA CRÍTICA** - Necesita intervención urgente y seguimiento especial\n`;
    }
    
    if (this.estudiantesConAsistencia.length > 0) {
      interpretacion += `\n📈 **SEGMENTACIÓN DE RENDIMIENTO ESTUDIANTIL:**\n`;
      interpretacion += `• **Estudiantes excelentes (≥90%):** ${estudiantesExcelentes} (${(estudiantesExcelentes/this.estudiantesConAsistencia.length*100).toFixed(1)}%) - Modelo a seguir\n`;
      interpretacion += `• **Estudiantes buenos (80-89%):** ${estudiantesBuenos} (${(estudiantesBuenos/this.estudiantesConAsistencia.length*100).toFixed(1)}%) - Rendimiento sólido\n`;
      interpretacion += `• **Estudiantes regulares (60-79%):** ${estudiantesRegulares} (${(estudiantesRegulares/this.estudiantesConAsistencia.length*100).toFixed(1)}%) - Necesitan apoyo\n`;
      interpretacion += `• **Estudiantes en riesgo (<60%):** ${estudiantesCriticos} (${(estudiantesCriticos/this.estudiantesConAsistencia.length*100).toFixed(1)}%) - Requieren intervención inmediata\n`;
    }
    
    interpretacion += `\n🔍 **ANÁLISIS DE RIESGOS ACADÉMICOS:**\n`;
    if (estudiantesCriticos > 0) {
      const riesgoCritico = (estudiantesCriticos / this.estudiantesConAsistencia.length) * 100;
      if (riesgoCritico > 20) {
        interpretacion += `• 🚨 **ALTO RIESGO INSTITUCIONAL** - ${riesgoCritico.toFixed(1)}% en situación crítica\n`;
      } else if (riesgoCritico > 10) {
        interpretacion += `• ⚠️ **RIESGO MODERADO** - ${riesgoCritico.toFixed(1)}% requiere atención prioritaria\n`;
      } else {
        interpretacion += `• 🟡 **RIESGO BAJO** - ${riesgoCritico.toFixed(1)}% en seguimiento especial\n`;
      }
    } else {
      interpretacion += `• 🟢 **SIN RIESGO CRÍTICO** - Todos los estudiantes mantienen asistencia aceptable\n`;
    }
    
    if (estudiantesInactivos > 0) {
      const tasaInactividad = (estudiantesInactivos / totalEstudiantes) * 100;
      interpretacion += `• **Tasa de inactividad:** ${tasaInactividad.toFixed(1)}% - ${tasaInactividad > 15 ? 'Preocupante' : tasaInactividad > 10 ? 'Moderada' : 'Controlada'}\n`;
    }
    
    interpretacion += `\n💡 **RECOMENDACIONES ESTRATÉGICAS:**\n`;
    if (estudiantesCriticos > 0) {
      interpretacion += `• **Programa de tutorías:** Implementar seguimiento personalizado para ${estudiantesCriticos} estudiantes en riesgo\n`;
    }
    if (estudiantesInactivos > 0) {
      interpretacion += `• **Plan de reactivación:** Contactar y motivar a ${estudiantesInactivos} estudiantes inactivos\n`;
    }
    if (promedioAsistencia < 80) {
      interpretacion += `• **Estrategias de engagement:** Desarrollar actividades más atractivas y participativas\n`;
    }
    interpretacion += `• **Meta institucional:** Alcanzar ${promedioAsistencia < 85 ? '85%' : '90%'} de asistencia promedio\n`;
    interpretacion += `• **Monitoreo continuo:** Seguimiento ${estudiantesCriticos > 0 ? 'semanal' : 'quincenal'} de estudiantes en riesgo\n`;
    interpretacion += `• **Reconocimiento:** Destacar y premiar a los ${estudiantesExcelentes} estudiantes con excelente asistencia`;
    
    return interpretacion;
  }

  /**
   * Configura la actualización automática de datos en tiempo real
   */
  private configurarActualizacionTiempoReal(): void {
    console.log('[InformesComponent] Configurando actualización en tiempo real...');
    
    // 1. Actualización cada 15 segundos usando observables
    this.updateSubscription = interval(15000).pipe(
      switchMap(() => {
        console.log('[InformesComponent] Actualizando datos automáticamente...');
        this.cargarMetricasGlobales();
        return forkJoin({
          distribucionAreas: this.informesService.getDistribucionPorArea(),
          cargaAcademica: this.informesService.getCargaAcademica(),
          materias: this.informesService.getDistribucionMaterias()
        });
      })
    ).subscribe({
      next: (datos) => {
        console.log('[InformesComponent] Datos actualizados exitosamente');
        this.distribucionAreas = datos.distribucionAreas;
        this.cargaAcademica = datos.cargaAcademica;
        this.distribucionMaterias = datos.materias;
        this.generarInforme(); // Regenerar el informe actual
      },
      error: (error) => {
        console.warn('[InformesComponent] Error en actualización automática:', error);
      }
    });

    // 2. Listener para cambios en localStorage (cuando se agregan/modifican datos)
    this.storageListener = (e: StorageEvent) => {
      if (e.key && ['profesort_usuarios', 'profesort_materias', 'profesort_asignaciones', 'profesort_asistencias'].includes(e.key)) {
        console.log(`[InformesComponent] Detectado cambio en ${e.key}, recargando datos...`);
        
        // Limpiar datos existentes para forzar recarga completa
        this.distribucionAreas = [];
        this.cargaAcademica = [];
        this.distribucionMaterias = [];
        this.estadisticasEstudiantes = null;
        this.distribucionEstudiantesPorArea = [];
        this.asistenciaSemanal = [];
        this.estudiantesConAsistencia = [];
        
        setTimeout(() => {
          this.forzarActualizacionCompleta();
        }, 500); // Pequeño delay para asegurar que los datos estén guardados
      }
    };
    window.addEventListener('storage', this.storageListener);

    // 3. Listener para eventos personalizados de actualización
    window.addEventListener('datos-actualizados', () => {
      console.log('[InformesComponent] Evento de datos actualizados recibido');
      this.forzarActualizacionCompleta();
    });

    // 4. Listener para eventos específicos de docentes, estudiantes y materias
    ['docente-agregado', 'docente-actualizado', 'estudiante-agregado', 'materia-agregada', 'materia-eliminada', 'materia-actualizada', 'asignacion-actualizada'].forEach(eventName => {
      window.addEventListener(eventName, () => {
        console.log(`[InformesComponent] Evento ${eventName} recibido, actualizando informes...`);
        this.forzarActualizacionCompleta();
      });
    });
  }

  /**
   * Fuerza una actualización completa de todos los datos e informes
   */
  private forzarActualizacionCompleta(): void {
    console.log('[InformesComponent] Forzando actualización completa...');
    
    // Limpiar todos los datos existentes
    this.distribucionAreas = [];
    this.cargaAcademica = [];
    this.estadisticasCarga = null;
    this.distribucionMaterias = [];
    this.estadisticasMaterias = null;
    this.estadisticasEstudiantes = null;
    this.distribucionEstudiantesPorArea = [];
    this.asistenciaSemanal = [];
    this.estudiantesConAsistencia = [];
    
    // Limpiar datos de gráficos
    this.datosGraficoAreas = null;
    this.datosGraficoCarga = null;
    this.datosGraficoMaterias = null;
    this.datosGraficoAsignacion = null;
    this.datosGraficoPieEstudiantes = null;
    this.datosGraficoAsistenciaSemanal = null;
    
    // Destruir gráficos dinámicos
    this.destruirGraficosDinamicos();
    
    // Recargar métricas globales y regenerar informe
    setTimeout(() => {
      this.cargarMetricasGlobales();
      this.generarInforme();
    }, 100);
  }

  /**
   * Destruir todos los gráficos dinámicos para evitar conflictos
   */
  private destruirGraficosDinamicos(): void {
    if (this.chartRendimientoAreas) {
      this.chartRendimientoAreas.destroy();
      this.chartRendimientoAreas = null;
    }
    if (this.chartComparativaMensual) {
      this.chartComparativaMensual.destroy();
      this.chartComparativaMensual = null;
    }
    if (this.chartVarianza) {
      this.chartVarianza.destroy();
      this.chartVarianza = null;
    }
  }

  /**
   * Método OnDestroy para limpiar suscripciones
   */
  ngOnDestroy(): void {
    console.log('[InformesComponent] Limpiando suscripciones...');
    
    // Destruir gráficos dinámicos
    this.destruirGraficosDinamicos();
    
    // Cancelar suscripción de actualización automática
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    
    // Remover listener de localStorage
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
    
    // Remover listeners de eventos personalizados
    window.removeEventListener('datos-actualizados', () => {});
    ['docente-agregado', 'docente-actualizado', 'estudiante-agregado', 'materia-agregada', 'materia-eliminada', 'asignacion-actualizada'].forEach(eventName => {
      window.removeEventListener(eventName, () => {});
    });
  }
}
