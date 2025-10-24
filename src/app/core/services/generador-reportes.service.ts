import { Injectable } from '@angular/core';
import { MetricasEstadisticas } from './alertas-estadisticas.service';

@Injectable({
  providedIn: 'root'
})
export class GeneradorReportesService {

  constructor() { }

  /**
   * Genera un informe completo en formato TXT
   */
  generarReporteTXT(
    metricas: MetricasEstadisticas | null,
    distribucionAreas: any[],
    cargaAcademica: any[],
    estadisticasCarga: any,
    distribucionMaterias: any[],
    estadisticasMaterias: any,
    estadisticasEstudiantes: any
  ): string {
    const fecha = new Date().toLocaleString('es-ES');
    const separador = '═════════════════════════════════════════════════════════════════════';
    
    let informe = `${separador}\n`;
    informe += `📊 INFORME INTEGRAL - PROFESORT ANALYTICS\n`;
    informe += `Sistema de Gestión Educativa con Análisis Estadístico\n`;
    informe += `${separador}\n\n`;
    
    informe += `📅 FECHA DE GENERACIÓN: ${fecha}\n`;
    informe += `🔐 FORMATO: Texto Plano (TXT)\n\n`;
    
    // ==================== RESUMEN EJECUTIVO ====================
    informe += `${separador}\n`;
    informe += `📋 1. RESUMEN EJECUTIVO\n`;
    informe += `${separador}\n\n`;
    
    informe += `🎯 INDICADORES CLAVE DEL SISTEMA:\n`;
    informe += `• Promedio de asistencia: ${metricas?.promedio_asistencia || 0}%\n`;
    informe += `• Estudiantes en situación crítica: ${metricas?.estudiantes_criticos || 0}\n`;
    informe += `• Promedio de materias por docente: ${metricas?.promedio_materias_docente || 0}\n`;
    informe += `• Total de materias: ${metricas?.total_materias || 0}\n`;
    informe += `• Materias sin asignar: ${metricas?.materias_sin_asignar || 0}\n\n`;
    
    // ==================== DATOS GENERALES ====================
    informe += `${separador}\n`;
    informe += `📊 2. ESTADÍSTICAS GENERALES\n`;
    informe += `${separador}\n\n`;
    
    informe += `✅ ESTADO DEL SISTEMA:\n`;
    informe += `• Promedio de asistencia institucional: ${metricas?.promedio_asistencia?.toFixed(2) || 'N/A'}%\n`;
    informe += `• Docentes sobrecargados: ${metricas?.docentes_sobrecargados || 0}\n`;
    informe += `• Estudiantes en riesgo: ${metricas?.estudiantes_en_riesgo || 0}\n`;
    informe += `• Estudiantes en situación crítica: ${metricas?.estudiantes_criticos || 0}\n`;
    informe += `• Coeficiente de Variación de Carga: ${metricas?.coeficiente_variacion_carga || 0}%\n\n`;
    
    // ==================== DISTRIBUCIÓN DE DOCENTES ====================
    informe += `${separador}\n`;
    informe += `👨‍🏫 3. DISTRIBUCIÓN DE DOCENTES POR ÁREA\n`;
    informe += `${separador}\n\n`;
    
    if (distribucionAreas.length > 0) {
      informe += `📊 CUADRO RESUMIDO:\n`;
      informe += `┌─────────────────────────┬──────────┬────────────┐\n`;
      informe += `│ Área de Conocimiento    │ Docentes │ Porcentaje │\n`;
      informe += `├─────────────────────────┼──────────┼────────────┤\n`;
      
      distribucionAreas.forEach(area => {
        const nombre = area.area.padEnd(23);
        const cantidad = String(area.cantidad).padStart(8);
        const porcentaje = String(area.porcentaje.toFixed(1)).padStart(10);
        informe += `│ ${nombre} │ ${cantidad} │ ${porcentaje}% │\n`;
      });
      
      informe += `└─────────────────────────┴──────────┴────────────┘\n\n`;
      
      const totalDocentes = distribucionAreas.reduce((sum, area) => sum + area.cantidad, 0);
      informe += `📈 ANÁLISIS ESTADÍSTICO:\n`;
      informe += `• Total de docentes: ${totalDocentes}\n`;
      informe += `• Promedio por área: ${(totalDocentes / distribucionAreas.length).toFixed(1)}\n`;
      informe += `• Área dominante: ${distribucionAreas.sort((a, b) => b.cantidad - a.cantidad)[0]?.area}\n`;
      informe += `• Áreas analizadas: ${distribucionAreas.length}\n\n`;
    }
    
    // ==================== CARGA ACADÉMICA DOCENTE ====================
    informe += `${separador}\n`;
    informe += `📚 4. CARGA ACADÉMICA DOCENTE\n`;
    informe += `${separador}\n\n`;
    
    if (estadisticasCarga) {
      informe += `📊 MEDIDAS DE TENDENCIA CENTRAL:\n`;
      informe += `• Promedio: ${estadisticasCarga.promedio.toFixed(2)} materias/docente\n`;
      informe += `• Mediana: ${estadisticasCarga.mediana} materias/docente\n`;
      informe += `• Moda: ${estadisticasCarga.moda} materias/docente\n`;
      informe += `• Mínimo: ${estadisticasCarga.minimo} materias\n`;
      informe += `• Máximo: ${estadisticasCarga.maximo} materias\n`;
      informe += `• Rango: ${estadisticasCarga.rango} materias\n\n`;
      
      informe += `📈 MEDIDAS DE DISPERSIÓN:\n`;
      informe += `• Varianza: ${estadisticasCarga.varianza.toFixed(2)} (materias²)\n`;
      informe += `• Desviación Estándar: ${estadisticasCarga.desviacionEstandar.toFixed(2)} materias\n`;
      informe += `• Coeficiente de Variación: ${estadisticasCarga.coeficienteVariacion.toFixed(1)}%\n\n`;
      
      const interpretacion = this.interpretarDesviacion(estadisticasCarga.desviacionEstandar);
      informe += `🎯 INTERPRETACIÓN:\n`;
      informe += `${interpretacion}\n\n`;
      
      if (cargaAcademica.length > 0) {
        const docentesSobrecarga = cargaAcademica.filter(d => d.cantidadMaterias > estadisticasCarga.promedio + (2 * estadisticasCarga.desviacionEstandar)).length;
        const docentesSinCarga = cargaAcademica.filter(d => d.cantidadMaterias === 0).length;
        
        informe += `⚠️ ANÁLISIS DE CASOS:\n`;
        informe += `• Docentes sin carga: ${docentesSinCarga}\n`;
        informe += `• Docentes sobrecargados (>2σ): ${docentesSobrecarga}\n`;
        informe += `• Total de docentes analizados: ${cargaAcademica.length}\n\n`;
      }
    }
    
    // ==================== TOP DOCENTES CON MAYOR CARGA ====================
    if (cargaAcademica.length > 0) {
      informe += `📊 TOP 10 DOCENTES CON MAYOR CARGA:\n`;
      const top10 = cargaAcademica
        .sort((a, b) => b.cantidadMaterias - a.cantidadMaterias)
        .slice(0, 10);
      
      informe += `┌────┬────────────────────────────┬──────────────┐\n`;
      informe += `│ # │ Docente                    │ # Materias   │\n`;
      informe += `├────┼────────────────────────────┼──────────────┤\n`;
      
      top10.forEach((docente, idx) => {
        const nombre = docente.nombreDocente.substring(0, 26).padEnd(26);
        const cantidad = String(docente.cantidadMaterias).padStart(12);
        informe += `│ ${String(idx + 1).padStart(2)} │ ${nombre} │ ${cantidad} │\n`;
      });
      
      informe += `└────┴────────────────────────────┴──────────────┘\n\n`;
    }
    
    // ==================== DISTRIBUCIÓN DE MATERIAS ====================
    informe += `${separador}\n`;
    informe += `📖 5. DISTRIBUCIÓN DE MATERIAS\n`;
    informe += `${separador}\n\n`;
    
    if (distribucionMaterias.length > 0) {
      informe += `📊 COBERTURA POR ÁREA:\n`;
      informe += `┌──────────────────────┬────────┬──────────┬─────────────┬────────┐\n`;
      informe += `│ Área                 │ Total  │ Asignadas│ Sin Asignar │ % Cob. │\n`;
      informe += `├──────────────────────┼────────┼──────────┼─────────────┼────────┤\n`;
      
      distribucionMaterias.forEach(area => {
        const nombre = area.area.padEnd(20);
        const total = String(area.totalMaterias).padStart(6);
        const asignadas = String(area.materiasAsignadas).padStart(8);
        const sinAsignar = String(area.materiasSinAsignar).padStart(11);
        const porcentaje = String(area.porcentajeAsignadas.toFixed(1)).padStart(6);
        
        informe += `│ ${nombre} │ ${total} │ ${asignadas} │ ${sinAsignar} │ ${porcentaje}% │\n`;
      });
      
      informe += `└──────────────────────┴────────┴──────────┴─────────────┴────────┘\n\n`;
    }
    
    if (estadisticasMaterias) {
      informe += `📈 RESUMEN DE COBERTURA:\n`;
      informe += `• Total de materias: ${estadisticasMaterias.totalMaterias}\n`;
      informe += `• Materias asignadas: ${estadisticasMaterias.totalAsignadas}\n`;
      informe += `• Materias sin asignar: ${estadisticasMaterias.totalSinAsignar}\n`;
      informe += `• Porcentaje de cobertura: ${estadisticasMaterias.porcentajeAsignacion.toFixed(1)}%\n\n`;
      
      const estado = this.interpretarCobertura(estadisticasMaterias.porcentajeAsignacion);
      informe += `🎯 ESTADO DE COBERTURA:\n`;
      informe += `${estado}\n\n`;
    }
    
    // ==================== ESTADÍSTICAS DE ESTUDIANTES ====================
    informe += `${separador}\n`;
    informe += `👥 6. ESTADÍSTICAS DE ESTUDIANTES Y ASISTENCIA\n`;
    informe += `${separador}\n\n`;
    
    if (estadisticasEstudiantes) {
      informe += `📊 DATOS GENERALES:\n`;
      informe += `• Total de estudiantes: ${estadisticasEstudiantes.totalEstudiantes}\n`;
      informe += `• Estudiantes activos: ${estadisticasEstudiantes.estudiantesActivos}\n`;
      informe += `• Estudiantes inactivos: ${estadisticasEstudiantes.totalEstudiantes - estadisticasEstudiantes.estudiantesActivos}\n`;
      informe += `• Porcentaje de actividad: ${estadisticasEstudiantes.porcentajeActivos.toFixed(1)}%\n`;
      informe += `• Promedio de asistencia: ${estadisticasEstudiantes.promedioAsistencia.toFixed(2)}%\n\n`;
      
      const interpretacionAsistencia = this.interpretarAsistencia(estadisticasEstudiantes.promedioAsistencia);
      informe += `🎯 NIVEL DE ASISTENCIA:\n`;
      informe += `${interpretacionAsistencia}\n\n`;
    }
    
    // ==================== RECOMENDACIONES ====================
    informe += `${separador}\n`;
    informe += `💡 7. RECOMENDACIONES Y ACCIONES SUGERIDAS\n`;
    informe += `${separador}\n\n`;
    
    const recomendaciones = this.generarRecomendaciones(
      estadisticasCarga,
      estadisticasMaterias,
      estadisticasEstudiantes,
      metricas
    );
    
    informe += recomendaciones;
    informe += '\n';
    
    // ==================== PIE ====================
    informe += `${separador}\n`;
    informe += `📄 INFORMACIÓN DEL REPORTE\n`;
    informe += `${separador}\n`;
    informe += `Generado: ${fecha}\n`;
    informe += `Sistema: PROFESORT ANALYTICS v2.0\n`;
    informe += `Tipo de Reporte: Integral\n`;
    informe += `Formato: Texto Plano (UTF-8)\n`;
    informe += `═════════════════════════════════════════════════════════════════════\n`;
    
    return informe;
  }

  /**
   * Interpreta el nivel de desviación estándar
   */
  private interpretarDesviacion(sigma: number): string {
    if (sigma < 1.0) {
      return '🟢 EXCELENTE: Distribución muy equilibrada, la carga académica es equitativa entre docentes.';
    } else if (sigma < 1.5) {
      return '🟡 BUENA: Distribución equilibrada con ligeras variaciones, situación controlada.';
    } else if (sigma < 2.0) {
      return '🟠 REGULAR: Variabilidad moderada, se recomiendan ajustes menores en la distribución.';
    } else {
      return '🔴 CRÍTICA: Alta variabilidad, redistribución urgente de materias necesaria.';
    }
  }

  /**
   * Interpreta el porcentaje de cobertura
   */
  private interpretarCobertura(porcentaje: number): string {
    if (porcentaje > 95) {
      return '🏆 EXCELENTE: Cobertura prácticamente completa, institución muy bien gestionada.';
    } else if (porcentaje > 90) {
      return '🟢 MUY BUENA: Cobertura alta, solo ajustes menores requeridos.';
    } else if (porcentaje > 80) {
      return '🟡 BUENA: Cobertura adecuada, algunas áreas requieren atención.';
    } else if (porcentaje > 70) {
      return '🟠 REGULAR: Cobertura insuficiente, requiere plan de mejora.';
    } else {
      return '🔴 CRÍTICA: Cobertura deficiente, requiere acción inmediata.';
    }
  }

  /**
   * Interpreta el nivel de asistencia
   */
  private interpretarAsistencia(promedio: number): string {
    if (promedio >= 90) {
      return '🏆 EXCELENTE (≥90%): Compromiso académico excepcional de la población estudiantil.';
    } else if (promedio >= 80) {
      return '🟢 MUY BUENA (80-89%): Buen nivel de asistencia y participación.';
    } else if (promedio >= 70) {
      return '🟡 ACEPTABLE (70-79%): Nivel estándar, se recomienda seguimiento.';
    } else if (promedio >= 60) {
      return '🟠 REGULAR (60-69%): Necesita estrategias de mejora del engagement.';
    } else {
      return '🔴 CRÍTICA (<60%): Requiere intervención inmediata y seguimiento especial.';
    }
  }

  /**
   * Genera recomendaciones basadas en los datos
   */
  private generarRecomendaciones(
    estadisticasCarga: any,
    estadisticasMaterias: any,
    estadisticasEstudiantes: any,
    metricas: MetricasEstadisticas | null
  ): string {
    let recomendaciones = '';
    const recomList: string[] = [];

    // Recomendaciones por carga académica
    if (estadisticasCarga) {
      if (estadisticasCarga.desviacionEstandar > 1.5) {
        recomList.push('⚠️ CARGA ACADÉMICA: La alta desviación estándar indica distribución inequitativa. Se recomienda redistribuir materias entre docentes.');
      } else if (estadisticasCarga.desviacionEstandar > 1.0) {
        recomList.push('ℹ️ CARGA ACADÉMICA: Monitorear la distribución, realizar ajustes menores según sea necesario.');
      }
    }

    // Recomendaciones por cobertura de materias
    if (estadisticasMaterias) {
      if (estadisticasMaterias.porcentajeAsignacion < 90) {
        recomList.push(`⚠️ COBERTURA ACADÉMICA: ${estadisticasMaterias.totalSinAsignar} materias sin asignar. Priorizar contratación de docentes en áreas críticas.`);
      } else if (estadisticasMaterias.porcentajeAsignacion < 95) {
        recomList.push('ℹ️ COBERTURA ACADÉMICA: Pocas materias sin asignar. Continuar búsqueda de docentes para completar cobertura.');
      }
    }

    // Recomendaciones por asistencia
    if (estadisticasEstudiantes) {
      if (estadisticasEstudiantes.promedioAsistencia < 70) {
        recomList.push(`⚠️ ASISTENCIA ESTUDIANTIL: Promedio bajo (${estadisticasEstudiantes.promedioAsistencia.toFixed(1)}%). Implementar estrategias de engagement y seguimiento personalizado.`);
      } else if (estadisticasEstudiantes.promedioAsistencia < 80) {
        recomList.push('ℹ️ ASISTENCIA ESTUDIANTIL: Aumentar actividades motivadoras para mejorar participación estudiantil.');
      }

      if (estadisticasEstudiantes.porcentajeActivos < 80) {
        recomList.push(`⚠️ ACTIVIDAD ESTUDIANTIL: ${estadisticasEstudiantes.totalEstudiantes - estadisticasEstudiantes.estudiantesActivos} estudiantes inactivos. Desarrollar plan de reactivación.`);
      }
    }

    // Si hay estudiantes críticos o en riesgo
    if (metricas && (metricas.estudiantes_criticos > 0 || metricas.estudiantes_en_riesgo > 0)) {
      recomList.push(`🚨 ATENCIÓN REQUERIDA: Hay estudiantes críticos y/o en riesgo que requieren atención inmediata. Revisar panel de alertas.`);
    }

    if (recomList.length === 0) {
      recomendaciones = '✅ Sin recomendaciones críticas. El sistema se encuentra en buen estado operacional.';
    } else {
      recomendaciones = recomList.join('\n');
    }

    return recomendaciones;
  }

  /**
   * Descarga el informe como archivo TXT
   */
  descargarReporteTXT(contenido: string, nombreArchivo: string = 'reporte-profesort'): void {
    const elemento = document.createElement('a');
    const archivo = new Blob([contenido], { type: 'text/plain; charset=utf-8' });
    elemento.href = URL.createObjectURL(archivo);
    elemento.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);
  }

  /**
   * Copia el informe al portapapeles
   */
  copiarAlPortapapeles(contenido: string): Promise<void> {
    return navigator.clipboard.writeText(contenido);
  }
}
