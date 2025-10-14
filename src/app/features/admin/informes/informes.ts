
import { Component, OnInit, AfterViewInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InformesService, DistribucionArea, CargaAcademica, EstadisticasCarga, DistribucionMaterias, EstadisticasMaterias } from '../../../core/services/informes.service';
import { AsistenciaService } from '../../../core/services/asistencia.service';
import { MateriasService } from '../../../core/services/materias.service';
import { GraficoBarrasComponent } from './grafico-barras';
import { GraficoPieComponent } from './grafico-pie';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-informes',
  standalone: true,
  templateUrl: './informes.html',
  styleUrls: ['./informes.css'],
  imports: [CommonModule, FormsModule, GraficoBarrasComponent, GraficoPieComponent]
})
export class InformesComponent implements OnInit, AfterViewInit {
  tipoInforme = 'distribucion-areas';
  informeGenerado = false;
  cargandoDatos = false;
  error = '';

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

  constructor(
    private informesService: InformesService,
    private asistenciaService: AsistenciaService,
    private materiasService: MateriasService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.generarInforme();
  }

  generarInforme(): void {
    this.cargandoDatos = true;
    this.error = '';
    this.informeGenerado = false;

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
    this.datosGraficoAreas = {
      tipo: 'barras',
      titulo: 'Distribución de Docentes por Área',
      etiquetas: this.distribucionAreas.map(item => item.area),
      datos: this.distribucionAreas.map(item => item.cantidad),
      colores: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4']
    };
  }

  private procesarDatosCarga(): void {
    const datosOrdenados = this.cargaAcademica
      .sort((a, b) => b.cantidadMaterias - a.cantidadMaterias)
      .slice(0, 15); 

    this.datosGraficoCarga = {
      tipo: 'barras',
      titulo: 'Carga Académica por Docente (Top 15)',
      etiquetas: datosOrdenados.map(item => item.nombreDocente),
      datos: datosOrdenados.map(item => item.cantidadMaterias),
      colores: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    };
  }

 
  private procesarDatosMaterias(): void {
  
    this.datosGraficoMaterias = {
      tipo: 'barras',
      titulo: 'Total de Materias por Área de Conocimiento',
      etiquetas: this.distribucionMaterias.map(item => item.area),
      datos: this.distribucionMaterias.map(item => item.totalMaterias),
      colores: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B']
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
    
    return `El área con mayor concentración de docentes es ${areaMayorDistribucion.area} con ${areaMayorDistribucion.cantidad} docentes (${areaMayorDistribucion.porcentaje}% del total).`;
  }

  getInterpretacionCarga(): string {
    if (!this.estadisticasCarga) return '';
    
    let interpretacion = `El promedio de materias por docente es ${this.getPromedioFormateado()}. `;
    
    if (this.estadisticasCarga.desviacionEstandar > 1.5) {
      interpretacion += 'La alta desviación estándar indica una distribución desigual de la carga académica.';
    } else {
      interpretacion += 'La distribución de carga académica es relativamente equilibrada.';
    }
    
    return interpretacion;
  }

 
  getInterpretacionMaterias(): string {
    if (!this.estadisticasMaterias || this.distribucionMaterias.length === 0) return '';
    
    const areaMayorSinAsignar = this.distribucionMaterias
      .reduce((prev, current) => prev.materiasSinAsignar > current.materiasSinAsignar ? prev : current);
    
    const areaMayorAsignacion = this.distribucionMaterias
      .reduce((prev, current) => prev.porcentajeAsignadas > current.porcentajeAsignadas ? prev : current);

    let interpretacion = `Del total de ${this.estadisticasMaterias.totalMaterias} materias, ${this.estadisticasMaterias.totalAsignadas} están asignadas (${this.getPorcentajeAsignacionFormateado()}%) y ${this.estadisticasMaterias.totalSinAsignar} sin asignar. `;
    
    interpretacion += `El área "${areaMayorSinAsignar.area}" tiene la mayor cantidad de materias sin asignar (${areaMayorSinAsignar.materiasSinAsignar}), `;
    interpretacion += `mientras que "${areaMayorAsignacion.area}" tiene el mayor porcentaje de asignación (${areaMayorAsignacion.porcentajeAsignadas.toFixed(1)}%).`;
    
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
    if (porcentaje >= 80) return '#28a745';
    if (porcentaje >= 60) return '#ffc107';
    return '#dc3545';
  }

  getEstadoAsistencia(porcentaje: number): string {
    if (porcentaje >= 80) return 'Excelente';
    if (porcentaje >= 70) return 'Buena';
    if (porcentaje >= 60) return 'Regular';
    return 'Crítica';
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
    this.asistenciaService.getAllAsistencias().subscribe((asistencias: any[]) => {
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
      
      // Obtener los últimos 6 meses
      const mesesOrdenados = Object.keys(mesesData).sort().slice(-6);
      
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
    const ctx = document.getElementById('graficoRendimientoAreas') as HTMLCanvasElement;
    if (!ctx) return;

    // Obtener datos de asistencia y materias, y calcular promedio por área
    this.asistenciaService.getAllAsistencias().subscribe((asistencias: any[]) => {
      this.materiasService.getMaterias().subscribe((materias: any[]) => {
        // Agrupar asistencias por área
        const areaStats: { [key: string]: { total: number, presentes: number } } = {};
        materias.forEach((materia: any) => {
          const area = materia.area || 'Sin Área';
          if (!areaStats[area]) {
            areaStats[area] = { total: 0, presentes: 0 };
          }
          const asistenciasMateria = asistencias.filter(a => a.id_materia === materia.id);
          areaStats[area].total += asistenciasMateria.length;
          areaStats[area].presentes += asistenciasMateria.filter(a => a.estado === 'PRESENTE').length;
        });

        const areas = Object.keys(areaStats);
        const promedios = areas.map(area => {
          const stats = areaStats[area];
          return stats.total > 0 ? (stats.presentes / stats.total) * 100 : 0;
        });

        const colores = [
          '#043237', '#0F8795', '#3abdcc', '#1a5f6f', '#2c8c9e', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B'
        ];

        // Destruir gráfico anterior si existe
        if (this.chartRendimientoAreas) {
          this.chartRendimientoAreas.destroy();
        }

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
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'Rendimiento de Asistencia por Área (Datos Reales)',
                font: {
                  size: 18,
                  weight: 'bold'
                }
              },
              tooltip: {
                callbacks: {
                  afterLabel: (context: any) => {
                    const index = context.dataIndex;
                    const area = areas[index];
                    const stats = areaStats[area];
                    return `Registros totales: ${stats.total}`;
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
      });
    });
  }

  private mostrarGraficoEjemploRendimiento(ctx: HTMLCanvasElement): void {
    if (this.chartRendimientoAreas) {
      this.chartRendimientoAreas.destroy();
    }
    
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
    const ctx = document.getElementById('graficoComparativaMensual') as HTMLCanvasElement;
    if (!ctx) return;

    // Calcular datos dinámicos
    this.calcularEvolucionMensual();
    
    if (this.evolucionAsistenciaMensual.length === 0) {
      this.mostrarGraficoEjemploEvolucion(ctx);
      return;
    }

    // Destruir gráfico anterior si existe
    if (this.chartComparativaMensual) {
      this.chartComparativaMensual.destroy();
    }
    
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
  }

  private mostrarGraficoEjemploEvolucion(ctx: HTMLCanvasElement): void {
    if (this.chartComparativaMensual) {
      this.chartComparativaMensual.destroy();
    }
    
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
}
