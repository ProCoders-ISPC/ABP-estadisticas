import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

export interface AlertaEstadistica {
  id: string;
  tipo: 'critica' | 'advertencia' | 'info';
  categoria: 'asistencia' | 'carga_docente' | 'materias' | 'distribucion';
  titulo: string;
  descripcion: string;
  mensaje: string; // Mensaje principal de la alerta
  valor_detectado: number;
  umbral: number;
  recomendacion: string;
  accionRecomendada: string; // Acción específica recomendada
  timestamp: Date;
  prioridad: number; // 1=Baja, 2=Media, 3=Alta, 4=Crítica
  estudiante_id?: number;
  estudiante_nombre?: string;
  docente_id?: number;
  docente_nombre?: string;
  materia_id?: number;
  area?: string;
  datosAdicionales?: {
    estudiantes?: any[];
    docentes?: any[];
    areas?: string[];
    desviacionActual?: number;
    desviacionObjetivo?: number;
    promedio?: number;
    porcentajeActual?: number;
    porcentajeObjetivo?: number;
    materiasAffectadas?: number;
    docentesSubutilizados?: number;
  };
}

export interface MetricasEstadisticas {
  // Asistencia
  promedio_asistencia: number;
  estudiantes_criticos: number;
  estudiantes_en_riesgo: number;
  
  // Carga Docente
  promedio_materias_docente: number;
  desviacion_estandar_carga: number;
  coeficiente_variacion_carga: number;
  docentes_sobrecargados: number;
  
  // Materias
  total_materias: number;
  materias_sin_asignar: number;
  porcentaje_sin_asignar: number;
  
  // Distribución
  coeficiente_variacion_areas: number;
  area_mayor_concentracion: string;
  area_menor_concentracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertasEstadisticasService {
  private alertasSubject = new BehaviorSubject<AlertaEstadistica[]>([]);
  private metricas$ = new BehaviorSubject<MetricasEstadisticas | null>(null);

  constructor() {}

  /**
   * Calcular todas las métricas estadísticas y generar alertas
   */
  calcularMetricasYAlertas(
    estudiantes: any[], 
    materias: any[], 
    docentes: any[], 
    asistencias: any[]
  ): Observable<{ metricas: MetricasEstadisticas; alertas: AlertaEstadistica[] }> {
    
    const metricas = this.calcularMetricas(estudiantes, materias, docentes, asistencias);
    const alertas = this.generarAlertas(metricas, estudiantes, materias, docentes);

    this.metricas$.next(metricas);
    this.alertasSubject.next(alertas);

    console.log('📊 Métricas calculadas:', metricas);
    console.log('🚨 Alertas generadas:', alertas.length);

    return new Observable(observer => {
      observer.next({ metricas, alertas });
      observer.complete();
    });
  }

  private calcularMetricas(
    estudiantes: any[], 
    materias: any[], 
    docentes: any[], 
    asistencias: any[]
  ): MetricasEstadisticas {
    
    // Calcular métricas de asistencia
    const asistenciaMetricas = this.calcularMetricasAsistencia(estudiantes, asistencias);
    
    // Calcular métricas de carga docente
    const cargaMetricas = this.calcularMetricasCargaDocente(materias, docentes);
    
    // Calcular métricas de materias
    const materiasMetricas = this.calcularMetricasMaterias(materias);
    
    // Calcular métricas de distribución
    const distribucionMetricas = this.calcularMetricasDistribucion(materias, docentes);

    return {
      ...asistenciaMetricas,
      ...cargaMetricas,
      ...materiasMetricas,
      ...distribucionMetricas
    };
  }

  private calcularMetricasAsistencia(estudiantes: any[], asistencias: any[]) {
    if (!asistencias || asistencias.length === 0) {
      return {
        promedio_asistencia: 0,
        estudiantes_criticos: 0,
        estudiantes_en_riesgo: 0
      };
    }

    // Agrupar asistencias por estudiante y calcular porcentajes
    const asistenciaPorEstudiante = new Map<number, { presentes: number; total: number }>();
    
    asistencias.forEach(asistencia => {
      const estudianteId = asistencia.estudiante_id || asistencia.id_estudiante;
      if (!asistenciaPorEstudiante.has(estudianteId)) {
        asistenciaPorEstudiante.set(estudianteId, { presentes: 0, total: 0 });
      }
      
      const datos = asistenciaPorEstudiante.get(estudianteId)!;
      datos.total++;
      if (asistencia.estado === 'PRESENTE' || asistencia.presente) {
        datos.presentes++;
      }
    });

    // Calcular porcentajes
    const porcentajes: number[] = [];
    let criticos = 0;
    let enRiesgo = 0;

    asistenciaPorEstudiante.forEach(datos => {
      const porcentaje = datos.total > 0 ? (datos.presentes / datos.total) * 100 : 0;
      porcentajes.push(porcentaje);
      
      if (porcentaje < 60) criticos++;
      else if (porcentaje < 75) enRiesgo++;
    });

    const promedio = porcentajes.length > 0 
      ? porcentajes.reduce((sum, p) => sum + p, 0) / porcentajes.length 
      : 0;

    return {
      promedio_asistencia: Math.round(promedio * 100) / 100,
      estudiantes_criticos: criticos,
      estudiantes_en_riesgo: enRiesgo
    };
  }

  private calcularMetricasCargaDocente(materias: any[], docentes: any[]) {
    if (!materias || materias.length === 0 || !docentes || docentes.length === 0) {
      return {
        promedio_materias_docente: 0,
        desviacion_estandar_carga: 0,
        coeficiente_variacion_carga: 0,
        docentes_sobrecargados: 0
      };
    }

    // Contar materias por docente
    const cargaPorDocente = new Map<number, number>();
    
    // Inicializar todos los docentes con 0
    docentes.forEach(docente => {
      cargaPorDocente.set(docente.id, 0);
    });

    // Contar materias asignadas
    materias.forEach(materia => {
      const docenteId = materia.docenteId || materia.docente_id;
      if (docenteId && cargaPorDocente.has(docenteId)) {
        cargaPorDocente.set(docenteId, cargaPorDocente.get(docenteId)! + 1);
      }
    });

    const cargas = Array.from(cargaPorDocente.values());
    const promedio = cargas.reduce((sum, c) => sum + c, 0) / cargas.length;
    
    // Calcular desviación estándar
    const varianza = cargas.reduce((sum, c) => sum + Math.pow(c - promedio, 2), 0) / cargas.length;
    const desviacion = Math.sqrt(varianza);
    
    // Coeficiente de variación
    const cv = promedio > 0 ? (desviacion / promedio) * 100 : 0;
    
    // Docentes sobrecargados - algoritmo mejorado
    // Usar un umbral dinámico más realista
    const materiasMaxima = Math.max(...cargas);
    const materiaMinima = Math.min(...cargas);
    const rangoTotal = materiasMaxima - materiaMinima;
    
    let sobrecargados = 0; // Inicializar variable
    
    // Si todas las cargas son muy similares (rango < 3), no hay sobrecarga real
    if (rangoTotal <= 2) {
      sobrecargados = 0; // No hay sobrecarga si el rango es muy pequeño
    } else {
      // Usar el mayor entre: promedio + 1.5σ o promedio + 3 materias (mínimo práctico)
      const umbralEstadistico = promedio + (1.5 * desviacion);
      const umbralPractico = promedio + 3;
      const umbralSobrecarga = Math.max(umbralEstadistico, umbralPractico);
      
      // También considerar un umbral absoluto: más de 6 materias es sobrecarga
      const umbralAbsoluto = 6;
      
      sobrecargados = cargas.filter(c => c > umbralSobrecarga || c > umbralAbsoluto).length;
    }

    return {
      promedio_materias_docente: Math.round(promedio * 100) / 100,
      desviacion_estandar_carga: Math.round(desviacion * 100) / 100,
      coeficiente_variacion_carga: Math.round(cv * 100) / 100,
      docentes_sobrecargados: sobrecargados
    };
  }

  private calcularMetricasMaterias(materias: any[]) {
    if (!materias || materias.length === 0) {
      return {
        total_materias: 0,
        materias_sin_asignar: 0,
        porcentaje_sin_asignar: 0
      };
    }

    const total = materias.length;
    const sinAsignar = materias.filter(m => !m.docenteId && !m.docente_id).length;
    const porcentaje = total > 0 ? (sinAsignar / total) * 100 : 0;

    return {
      total_materias: total,
      materias_sin_asignar: sinAsignar,
      porcentaje_sin_asignar: Math.round(porcentaje * 100) / 100
    };
  }

  private calcularMetricasDistribucion(materias: any[], docentes: any[]) {
    if (!docentes || docentes.length === 0) {
      return {
        coeficiente_variacion_areas: 0,
        area_mayor_concentracion: '',
        area_menor_concentracion: ''
      };
    }

    // Contar docentes por área
    const docentesPorArea = new Map<string, number>();
    
    docentes.forEach(docente => {
      const area = docente.area || 'SIN_AREA';
      docentesPorArea.set(area, (docentesPorArea.get(area) || 0) + 1);
    });

    if (docentesPorArea.size === 0) {
      return {
        coeficiente_variacion_areas: 0,
        area_mayor_concentracion: '',
        area_menor_concentracion: ''
      };
    }

    const valores = Array.from(docentesPorArea.values());
    const promedio = valores.reduce((sum, v) => sum + v, 0) / valores.length;
    
    // Calcular desviación estándar
    const varianza = valores.reduce((sum, v) => sum + Math.pow(v - promedio, 2), 0) / valores.length;
    const desviacion = Math.sqrt(varianza);
    
    // Coeficiente de variación
    const cv = promedio > 0 ? (desviacion / promedio) * 100 : 0;

    // Encontrar área con mayor y menor concentración
    let areaMayor = '';
    let areaMenor = '';
    let maxDocentes = 0;
    let minDocentes = Infinity;

    docentesPorArea.forEach((cantidad, area) => {
      if (cantidad > maxDocentes) {
        maxDocentes = cantidad;
        areaMayor = area;
      }
      if (cantidad < minDocentes) {
        minDocentes = cantidad;
        areaMenor = area;
      }
    });

    return {
      coeficiente_variacion_areas: Math.round(cv * 100) / 100,
      area_mayor_concentracion: areaMayor,
      area_menor_concentracion: areaMenor
    };
  }

  private generarAlertas(
    metricas: MetricasEstadisticas, 
    estudiantes: any[], 
    materias: any[], 
    docentes: any[]
  ): AlertaEstadistica[] {
    const alertas: AlertaEstadistica[] = [];

    // Alertas de asistencia
    if (metricas.estudiantes_criticos > 0) {
      alertas.push({
        id: `asistencia_critica_${Date.now()}`,
        tipo: 'critica',
        categoria: 'asistencia',
        titulo: 'Estudiantes con asistencia crítica',
        descripcion: `${metricas.estudiantes_criticos} estudiante(s) con asistencia inferior al 60%`,
        mensaje: `Se detectaron ${metricas.estudiantes_criticos} estudiantes con asistencia crítica que requieren intervención inmediata`,
        valor_detectado: metricas.estudiantes_criticos,
        umbral: 0,
        recomendacion: 'Convocar a tutoría académica y contactar a los padres/tutores. Implementar plan de seguimiento personalizado.',
        accionRecomendada: 'Convocar inmediatamente a tutoría académica',
        prioridad: 4,
        timestamp: new Date(),
        datosAdicionales: {
          porcentajeActual: metricas.promedio_asistencia,
          porcentajeObjetivo: 85
        }
      });
    }

    if (metricas.estudiantes_en_riesgo > 0) {
      alertas.push({
        id: `asistencia_riesgo_${Date.now()}`,
        tipo: 'advertencia',
        categoria: 'asistencia',
        titulo: 'Estudiantes en riesgo',
        descripcion: `${metricas.estudiantes_en_riesgo} estudiante(s) con asistencia entre 60-75%`,
        mensaje: `${metricas.estudiantes_en_riesgo} estudiantes requieren seguimiento preventivo por asistencia irregular`,
        valor_detectado: metricas.estudiantes_en_riesgo,
        umbral: 75,
        recomendacion: 'Realizar seguimiento semanal y notificar situación a coordinación académica.',
        accionRecomendada: 'Implementar seguimiento semanal',
        prioridad: 3,
        timestamp: new Date(),
        datosAdicionales: {
          porcentajeActual: metricas.promedio_asistencia,
          porcentajeObjetivo: 85
        }
      });
    }

    // Alertas de carga docente
    if (metricas.desviacion_estandar_carga > 1.5) {
      alertas.push({
        id: `carga_desigual_${Date.now()}`,
        tipo: 'critica',
        categoria: 'carga_docente',
        titulo: 'Distribución desigual de carga académica',
        descripcion: `La desviación estándar es ${metricas.desviacion_estandar_carga}, indicando distribución inequitativa`,
        mensaje: `La distribución de carga docente presenta alta variabilidad que puede afectar la calidad educativa`,
        valor_detectado: metricas.desviacion_estandar_carga,
        umbral: 1.5,
        recomendacion: 'Revisar asignaciones y redistribuir materias para equilibrar la carga. Meta: Desviación estándar < 1.5',
        accionRecomendada: 'Redistribuir materias entre docentes',
        prioridad: 4,
        timestamp: new Date(),
        datosAdicionales: {
          desviacionActual: metricas.desviacion_estandar_carga,
          desviacionObjetivo: 1.5,
          promedio: metricas.promedio_materias_docente
        }
      });
    }

    if (metricas.docentes_sobrecargados > 0) {
      alertas.push({
        id: `docentes_sobrecargados_${Date.now()}`,
        tipo: 'critica',
        categoria: 'carga_docente',
        titulo: 'Docentes sobrecargados detectados',
        descripcion: `${metricas.docentes_sobrecargados} docente(s) con carga superior a μ + 2σ`,
        mensaje: `Docentes identificados con sobrecarga académica que puede comprometer la calidad educativa`,
        valor_detectado: metricas.docentes_sobrecargados,
        umbral: 0,
        recomendacion: 'Reasignar materias inmediatamente para evitar burnout docente y mantener calidad educativa.',
        accionRecomendada: 'Reasignar materias inmediatamente',
        prioridad: 4,
        timestamp: new Date(),
        datosAdicionales: {
          promedio: metricas.promedio_materias_docente
        }
      });
    }

    // Alertas de materias SIN ASIGNAR
    // CRÍTICA: Incluso 1 materia sin asignar requiere atención
    if (metricas.materias_sin_asignar >= 1) {
      alertas.push({
        id: `materias_sin_asignar_${Date.now()}`,
        tipo: metricas.materias_sin_asignar > 3 ? 'critica' : 'advertencia',
        categoria: 'materias',
        titulo: metricas.materias_sin_asignar === 1 
          ? 'Materia sin asignar detectada' 
          : `${metricas.materias_sin_asignar} materias sin asignar`,
        descripcion: `${metricas.materias_sin_asignar} materia(s) sin docente asignado (${metricas.porcentaje_sin_asignar.toFixed(1)}% del total)`,
        mensaje: `${metricas.materias_sin_asignar} materia(s) requiere(n) asignación de docente para garantizar cobertura educativa`,
        valor_detectado: metricas.materias_sin_asignar,
        umbral: 1, // Ahora el umbral es incluso 1 materia
        recomendacion: `Asignar docente a ${metricas.materias_sin_asignar === 1 ? 'la materia' : 'las materias'} disponible${metricas.materias_sin_asignar > 1 ? 's' : ''} para garantizar cobertura educativa completa.`,
        accionRecomendada: `Asignar docente(s) a ${metricas.materias_sin_asignar === 1 ? 'materia' : 'materias'} vacante`,
        prioridad: metricas.materias_sin_asignar > 3 ? 4 : 3,
        timestamp: new Date(),
        datosAdicionales: {
          porcentajeActual: metricas.porcentaje_sin_asignar,
          porcentajeObjetivo: 0,
          materiasAffectadas: metricas.materias_sin_asignar
        }
      });
    }

    // Alertas de DOCENTES SUBUTILIZADOS
    // Detectar docentes con muy pocas materias (< 2)
    const cargaPorDocente = new Map<number, number>();
    docentes.forEach(docente => {
      cargaPorDocente.set(docente.id || docente.id_usuario, 0);
    });
    materias.forEach(materia => {
      const docenteId = materia.docenteId || materia.docente_id;
      if (docenteId && cargaPorDocente.has(docenteId)) {
        cargaPorDocente.set(docenteId, cargaPorDocente.get(docenteId)! + 1);
      }
    });

    const docentesSubutilizados = Array.from(cargaPorDocente.values()).filter(c => c > 0 && c < 2).length;
    if (docentesSubutilizados > 0) {
      alertas.push({
        id: `docentes_subutilizados_${Date.now()}`,
        tipo: 'advertencia',
        categoria: 'carga_docente',
        titulo: docentesSubutilizados === 1 
          ? 'Docente subutilizado' 
          : `${docentesSubutilizados} docentes subutilizados`,
        descripcion: `${docentesSubutilizados} docente(s) con menos de 2 materias asignadas`,
        mensaje: `Se detectaron ${docentesSubutilizados} docente(s) con carga académica baja que podrían tomar asignaciones adicionales`,
        valor_detectado: docentesSubutilizados,
        umbral: 1,
        recomendacion: `Considerar asignar materias adicionales a ${docentesSubutilizados === 1 ? 'este docente' : 'estos docentes'} para optimizar recursos.`,
        accionRecomendada: `Asignar materias a docentes subutilizados`,
        prioridad: 2,
        timestamp: new Date(),
        datosAdicionales: {
          docentesSubutilizados
        }
      });
    }

    // Alertas de distribución
    if (metricas.coeficiente_variacion_areas > 50) {
      alertas.push({
        id: `distribucion_desigual_${Date.now()}`,
        tipo: 'advertencia',
        categoria: 'distribucion',
        titulo: 'Distribución desigual de docentes por área',
        descripcion: `El coeficiente de variación es ${metricas.coeficiente_variacion_areas}%, indicando alta variabilidad`,
        mensaje: `La distribución de docentes por área académica presenta desequilibrios significativos`,
        valor_detectado: metricas.coeficiente_variacion_areas,
        umbral: 50,
        recomendacion: 'Evaluar necesidades reales de cada área y considerar redistribución de recursos humanos.',
        accionRecomendada: 'Redistribuir docentes entre áreas',
        prioridad: 2,
        timestamp: new Date(),
        datosAdicionales: {
          areas: [metricas.area_mayor_concentracion, metricas.area_menor_concentracion]
        }
      });
    }

    return alertas.sort((a, b) => {
      // Ordenar por prioridad: críticas primero, luego advertencias
      const prioridad = { 'critica': 3, 'advertencia': 2, 'info': 1 };
      return prioridad[b.tipo] - prioridad[a.tipo];
    });
  }

  /**
   * Obtener alertas actuales
   */
  getAlertas(): Observable<AlertaEstadistica[]> {
    return this.alertasSubject.asObservable();
  }

  /**
   * Obtener métricas actuales
   */
  getMetricas(): Observable<MetricasEstadisticas | null> {
    return this.metricas$.asObservable();
  }

  /**
   * Obtener interpretación automática de las métricas
   */
  getInterpretacionMetricas(metricas: MetricasEstadisticas): string {
    const interpretaciones: string[] = [];

    // Interpretación de carga docente
    if (metricas.coeficiente_variacion_carga < 30) {
      interpretaciones.push('✅ Excelente: Distribución equilibrada de carga académica.');
    } else if (metricas.coeficiente_variacion_carga < 50) {
      interpretaciones.push('🟡 Regular: Existe variabilidad moderada. Se recomiendan ajustes menores.');
    } else {
      interpretaciones.push('🔴 Crítico: Alta variabilidad en la distribución. Redistribución necesaria.');
    }

    // Interpretación de asistencia
    if (metricas.promedio_asistencia >= 85) {
      interpretaciones.push('✅ Excelente: Promedio de asistencia muy bueno.');
    } else if (metricas.promedio_asistencia >= 75) {
      interpretaciones.push('🟡 Regular: Promedio de asistencia aceptable, pero con margen de mejora.');
    } else {
      interpretaciones.push('🔴 Crítico: Promedio de asistencia por debajo del umbral institucional.');
    }

    // Interpretación específica de distribución
    const { promedio_materias_docente: promedio, desviacion_estandar_carga: desviacion } = metricas;
    if (promedio > 0 && desviacion > 0) {
      const mediana_estimada = promedio * 0.9; // Estimación conservadora
      if (promedio > mediana_estimada) {
        interpretaciones.push(`📊 Distribución asimétrica positiva detectada: algunos docentes tienen cargas significativamente superiores al promedio (${promedio} materias).`);
      }
    }

    return interpretaciones.join('\n\n');
  }

  /**
   * Limpiar alertas
   */
  limpiarAlertas(): void {
    this.alertasSubject.next([]);
  }
}