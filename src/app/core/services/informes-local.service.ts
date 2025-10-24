import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { DistribucionArea, CargaAcademica, EstadisticasCarga, DistribucionMaterias, EstadisticasMaterias } from './informes.service';

@Injectable({
  providedIn: 'root'
})
export class InformesLocalService {
  
  constructor(private localStorageService: LocalStorageService) {}

  getDistribucionPorArea(): Observable<DistribucionArea[]> {
    return new Observable(observer => {
      console.log('[InformesLocalService] getDistribucionPorArea: Iniciando cálculo de distribución de docentes por área (usando asignaciones).');

      const usuarios = this.localStorageService.getUsuarios();
      const materias = this.localStorageService.getMaterias();
      const asignaciones = this.localStorageService.getAsignaciones();
      
      console.log('[InformesLocalService] getDistribucionPorArea: Usuarios obtenidos:', usuarios.length);
      console.log('[InformesLocalService] getDistribucionPorArea: Materias obtenidas:', materias.length);
      console.log('[InformesLocalService] getDistribucionPorArea: Asignaciones obtenidas:', asignaciones.length);

      const docentes = usuarios.filter(u => u.id_rol === 2);
      console.log('[InformesLocalService] getDistribucionPorArea: Total de docentes:', docentes.length);
      
      // NUEVO ENFOQUE: Contar docentes que tienen ASIGNACIONES ACTIVAS POR ÁREA DE LA MATERIA
      const docentesConAsignaciones = new Set<number>(); // IDs de docentes con asignaciones activas
      const areaCount: { [key: string]: Set<number> } = {}; // Mapa de área -> Set de IDs de docentes
      
      // Procesar asignaciones activas
      asignaciones.forEach(asignacion => {
        if (asignacion.estado === 'ACTIVO') {
          const materia = materias.find(m => m.id === asignacion.id_materia);
          if (materia) {
            const area = materia.area || 'SIN_AREA';
            
            // Inicializar Set para esta área si no existe
            if (!areaCount[area]) {
              areaCount[area] = new Set<number>();
            }
            
            // Agregar el docente a esta área
            areaCount[area].add(asignacion.id_usuario);
            docentesConAsignaciones.add(asignacion.id_usuario);
            
            console.log(`[InformesLocalService] getDistribucionPorArea: Docente ${asignacion.id_usuario} asignado a materia "${materia.nombre}" en área "${area}"`);
          }
        }
      });
      
      console.log('[InformesLocalService] getDistribucionPorArea: Docentes únicos con asignaciones activas:', docentesConAsignaciones.size);
      console.log('[InformesLocalService] getDistribucionPorArea: Conteo por área:', Object.entries(areaCount).map(([area, set]) => ({ area, cantidad: set.size })));

      const total = docentesConAsignaciones.size; // Total de docentes con asignaciones activas
      console.log('[InformesLocalService] getDistribucionPorArea: Total de docentes con asignaciones activas:', total);

      const distribucion: DistribucionArea[] = Object.keys(areaCount)
        .filter(area => areaCount[area].size > 0) // Solo áreas con docentes asignados
        .map(area => ({
          area: area,
          cantidad: areaCount[area].size,
          porcentaje: total > 0 ? parseFloat(((areaCount[area].size / total) * 100).toFixed(2)) : 0
        }))
        .sort((a, b) => b.cantidad - a.cantidad);
      
      console.log('[InformesLocalService] getDistribucionPorArea: Distribución final calculada:', distribucion);

      // Si no hay docentes con asignaciones, mostrar distribución por área de docentes como fallback
      if (distribucion.length === 0) {
        console.warn('[InformesLocalService] getDistribucionPorArea: No hay docentes con asignaciones activas. Usando fallback (área del docente).');
        
        const areaCountFallback: { [key: string]: number } = {};
        docentes.forEach(docente => {
          const area = docente.area || 'SIN_AREA';
          areaCountFallback[area] = (areaCountFallback[area] || 0) + 1;
        });
        
        const totalDocentes = docentes.length;
        const distribucionFallback: DistribucionArea[] = Object.keys(areaCountFallback).map(area => ({
          area: area,
          cantidad: areaCountFallback[area],
          porcentaje: totalDocentes > 0 ? parseFloat(((areaCountFallback[area] / totalDocentes) * 100).toFixed(2)) : 0
        })).sort((a, b) => b.cantidad - a.cantidad);
        
        observer.next(distribucionFallback);
      } else {
        observer.next(distribucion);
      }
      
      observer.complete();
    });
  }

  getCargaAcademica(): Observable<CargaAcademica[]> {
    return new Observable(observer => {
      const usuarios = this.localStorageService.getUsuarios();
      const materias = this.localStorageService.getMaterias();
      const asignaciones = this.localStorageService.getAsignaciones();
      const docentes = usuarios.filter(u => u.id_rol === 2);

      const cargaAcademica: CargaAcademica[] = docentes.map(docente => {
        // Obtener asignaciones activas del docente
        const asignacionesDocente = asignaciones.filter(
          a => a.id_usuario === docente.id && a.estado === 'ACTIVO'
        );

        // Obtener nombres de materias
        const materiasDocente = asignacionesDocente.map(asig => {
          const materia = materias.find(m => m.id === asig.id_materia);
          return materia ? materia.nombre : 'Materia no encontrada';
        });

        return {
          docenteId: docente.id,
          nombreDocente: docente.name,
          cantidadMaterias: asignacionesDocente.length,
          materias: materiasDocente,
          area: docente.area || 'SIN_AREA'
        };
      }).sort((a, b) => b.cantidadMaterias - a.cantidadMaterias);

      observer.next(cargaAcademica);
      observer.complete();
    });
  }

  getEstadisticasCarga(): Observable<EstadisticasCarga> {
    return new Observable(observer => {
      this.getCargaAcademica().subscribe(carga => {
        const cantidades = carga.map(c => c.cantidadMaterias);
        
        if (cantidades.length === 0) {
          observer.next({
            promedio: 0,
            mediana: 0,
            moda: 0,
            maximo: 0,
            minimo: 0,
            desviacionEstandar: 0,
            varianza: 0,
            coeficienteVariacion: 0,
            rango: 0,
            interpretacion: 'Sin datos disponibles'
          });
          observer.complete();
          return;
        }

        // Media aritmética
        const suma = cantidades.reduce((a, b) => a + b, 0);
        const promedio = suma / cantidades.length;
        
        // Mediana
        const cantidadesOrdenadas = [...cantidades].sort((a, b) => a - b);
        const mediana = cantidadesOrdenadas.length % 2 === 0
          ? (cantidadesOrdenadas[cantidadesOrdenadas.length / 2 - 1] + cantidadesOrdenadas[cantidadesOrdenadas.length / 2]) / 2
          : cantidadesOrdenadas[Math.floor(cantidadesOrdenadas.length / 2)];
        
        // Moda (valor más frecuente)
        const frecuencias: { [key: number]: number } = {};
        cantidades.forEach(val => {
          frecuencias[val] = (frecuencias[val] || 0) + 1;
        });
        const moda = parseInt(Object.keys(frecuencias).reduce((a, b) => 
          frecuencias[parseInt(a)] > frecuencias[parseInt(b)] ? a : b
        ));
        
        // Máximo y mínimo
        const maximo = Math.max(...cantidades);
        const minimo = Math.min(...cantidades);
        
        // Rango
        const rango = maximo - minimo;
        
        // Varianza
        const varianza = cantidades.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / cantidades.length;
        
        // Desviación estándar
        const desviacionEstandar = Math.sqrt(varianza);
        
        // Coeficiente de variación (CV)
        const coeficienteVariacion = promedio > 0 ? (desviacionEstandar / promedio) * 100 : 0;
        
        // Interpretación automática
        let interpretacion = '';
        if (desviacionEstandar < 1.0) {
          interpretacion = 'Excelente: Distribución muy equilibrada de carga académica.';
        } else if (desviacionEstandar < 1.5) {
          interpretacion = 'Buena: Distribución equilibrada con variación mínima.';
        } else if (desviacionEstandar < 2.0) {
          interpretacion = 'Regular: Existe variabilidad moderada. Se recomiendan ajustes menores.';
        } else {
          interpretacion = 'Crítica: Alta variabilidad. Requiere redistribución urgente de materias.';
        }

        observer.next({
          promedio: parseFloat(promedio.toFixed(2)),
          mediana: parseFloat(mediana.toFixed(2)),
          moda: moda,
          maximo,
          minimo,
          desviacionEstandar: parseFloat(desviacionEstandar.toFixed(2)),
          varianza: parseFloat(varianza.toFixed(2)),
          coeficienteVariacion: parseFloat(coeficienteVariacion.toFixed(2)),
          rango: rango,
          interpretacion: interpretacion
        });
        observer.complete();
      });
    });
  }

  getDistribucionMaterias(): Observable<DistribucionMaterias[]> {
    return new Observable(observer => {
      const materias = this.localStorageService.getMaterias();
      const asignaciones = this.localStorageService.getAsignaciones();

      // Inicializar contador dinámico solo con áreas que existen en las materias
      const areaCount: { [key: string]: {
        total: number;
        asignadas: number;
        sinAsignar: number;
      }} = {};

      materias.forEach(materia => {
        const area = materia.area || 'SIN_AREA';
        if (!areaCount[area]) {
          areaCount[area] = { total: 0, asignadas: 0, sinAsignar: 0 };
        }
        
        areaCount[area].total++;
        
        // Verificar si tiene asignación activa
        const tieneAsignacion = asignaciones.some(
          a => a.id_materia === materia.id && a.estado === 'ACTIVO'
        );
        
        if (tieneAsignacion) {
          areaCount[area].asignadas++;
        } else {
          areaCount[area].sinAsignar++;
        }
      });

      // Solo incluir áreas que tienen materias
      const distribucion: DistribucionMaterias[] = Object.keys(areaCount)
        .filter(area => areaCount[area].total > 0) // Filtrar áreas sin materias
        .map(area => {
          const datos = areaCount[area];
          const porcentajeAsignadas = datos.total > 0 
            ? parseFloat(((datos.asignadas / datos.total) * 100).toFixed(2))
            : 0;
          
          return {
            area: area,
            totalMaterias: datos.total,
            materiasAsignadas: datos.asignadas,
            materiasSinAsignar: datos.sinAsignar,
            porcentajeAsignadas: porcentajeAsignadas,
            porcentajeSinAsignar: parseFloat((100 - porcentajeAsignadas).toFixed(2))
          };
        }).sort((a, b) => b.totalMaterias - a.totalMaterias);

      observer.next(distribucion);
      observer.complete();
    });
  }

  getEstadisticasMaterias(): Observable<EstadisticasMaterias> {
    return new Observable(observer => {
      this.getDistribucionMaterias().subscribe(distribucion => {
        const totalMaterias = distribucion.reduce((sum, d) => sum + d.totalMaterias, 0);
        const totalAsignadas = distribucion.reduce((sum, d) => sum + d.materiasAsignadas, 0);
        const totalSinAsignar = distribucion.reduce((sum, d) => sum + d.materiasSinAsignar, 0);
        
        const porcentajeAsignacion = totalMaterias > 0 
          ? parseFloat(((totalAsignadas / totalMaterias) * 100).toFixed(2))
          : 0;

        // Áreas con mayor asignación (>= 80%)
        const areasMayorAsignacion = distribucion
          .filter(d => d.porcentajeAsignadas >= 80)
          .map(d => d.area);

        // Áreas con menor asignación (< 50%)
        const areasMenorAsignacion = distribucion
          .filter(d => d.porcentajeAsignadas < 50)
          .map(d => d.area);

        observer.next({
          totalMaterias,
          totalAsignadas,
          totalSinAsignar,
          porcentajeAsignacion,
          areasMayorAsignacion,
          areasMenorAsignacion
        });
        observer.complete();
      });
    });
  }

  // === MÉTODOS PARA ESTUDIANTES ===
  getEstadisticasEstudiantes(): Observable<any> {
    return new Observable(observer => {
      const usuarios = this.localStorageService.getUsuarios();
      const estudiantes = usuarios.filter(u => u.id_rol === 3);
      const asistencias = this.localStorageService.getAsistencias();
      
      const totalEstudiantes = estudiantes.length;
      const estudiantesActivos = estudiantes.filter(e => e.is_active).length;
      const estudiantesInactivos = estudiantes.filter(e => !e.is_active).length;
      const porcentajeActivos = totalEstudiantes > 0 
        ? parseFloat(((estudiantesActivos / totalEstudiantes) * 100).toFixed(2))
        : 0;

      // Calcular promedio de asistencia general
      let totalAsistenciasPorcentaje = 0;
      let estudiantesConAsistencia = 0;

      estudiantes.forEach(estudiante => {
        const asistenciasEstudiante = asistencias.filter(a => a.id_estudiante === estudiante.id);
        if (asistenciasEstudiante.length > 0) {
          const presentes = asistenciasEstudiante.filter(a => a.estado === 'PRESENTE').length;
          const tardanzas = asistenciasEstudiante.filter(a => a.estado === 'TARDANZA').length;
          const porcentaje = ((presentes + (tardanzas * 0.5)) / asistenciasEstudiante.length) * 100;
          totalAsistenciasPorcentaje += porcentaje;
          estudiantesConAsistencia++;
        }
      });

      const promedioAsistencia = estudiantesConAsistencia > 0 
        ? parseFloat((totalAsistenciasPorcentaje / estudiantesConAsistencia).toFixed(2))
        : 0;

      observer.next({
        totalEstudiantes,
        estudiantesActivos,
        estudiantesInactivos,
        porcentajeActivos,
        promedioAsistencia
      });
      observer.complete();
    });
  }

  getDistribucionEstudiantesPorArea(): Observable<any[]> {
    return new Observable(observer => {
      const materias = this.localStorageService.getMaterias();
      const usuarios = this.localStorageService.getUsuarios();
      const asignaciones = this.localStorageService.getAsignaciones();
      const estudiantes = usuarios.filter(u => u.id_rol === 3);
      
      // Si no hay materias, devolver array vacío
      if (materias.length === 0) {
        observer.next([]);
        observer.complete();
        return;
      }
      
      // Contar estudiantes por área basándose en las materias que tienen asignaciones activas
      const areaCount: { [key: string]: Set<number> } = {};
      
      // Inicializar solo con áreas que tienen materias
      materias.forEach(materia => {
        const area = materia.area || 'SIN_AREA';
        if (!areaCount[area]) {
          areaCount[area] = new Set<number>();
        }
      });
      
      // Contar estudiantes únicos por área según sus asistencias/materias
      const asistencias = this.localStorageService.getAsistencias();
      asistencias.forEach(asistencia => {
        const materia = materias.find(m => m.id === asistencia.id_materia);
        if (materia) {
          const area = materia.area || 'SIN_AREA';
          if (areaCount[area]) {
            areaCount[area].add(asistencia.id_estudiante);
          }
        }
      });
      
      // Convertir a formato esperado y filtrar áreas vacías
      const distribucion = Object.keys(areaCount)
        .filter(area => areaCount[area].size > 0)
        .map(area => ({
          label: area,
          value: areaCount[area].size
        })).sort((a, b) => b.value - a.value);

      // Si no hay datos de estudiantes con asistencia, usar conteo de materias como fallback
      if (distribucion.length === 0) {
        const materiasPorArea: { [key: string]: number } = {};
        materias.forEach(materia => {
          const area = materia.area || 'SIN_AREA';
          materiasPorArea[area] = (materiasPorArea[area] || 0) + 1;
        });
        
        const distribucionFallback = Object.keys(materiasPorArea).map(area => ({
          label: area,
          value: materiasPorArea[area]
        })).sort((a, b) => b.value - a.value);
        
        observer.next(distribucionFallback);
      } else {
        observer.next(distribucion);
      }
      
      observer.complete();
    });
  }

  getAsistenciaSemanal(): Observable<any[]> {
    return new Observable(observer => {
      const asistencias = this.localStorageService.getAsistencias();
      
      // Agrupar por semana
      const semanaMap: { [key: string]: { presentes: number; ausentes: number; tardanzas: number; total: number } } = {};
      
      asistencias.forEach(asistencia => {
        const fecha = new Date(asistencia.fecha);
        const semana = this.getWeekNumber(fecha);
        const key = `Semana ${semana}`;
        
        if (!semanaMap[key]) {
          semanaMap[key] = { presentes: 0, ausentes: 0, tardanzas: 0, total: 0 };
        }
        
        semanaMap[key].total++;
        if (asistencia.estado === 'PRESENTE') semanaMap[key].presentes++;
        if (asistencia.estado === 'AUSENTE') semanaMap[key].ausentes++;
        if (asistencia.estado === 'TARDANZA') semanaMap[key].tardanzas++;
      });

      const asistenciaSemanal = Object.keys(semanaMap).map(semana => {
        const datos = semanaMap[semana];
        const porcentaje = datos.total > 0 
          ? parseFloat((((datos.presentes + (datos.tardanzas * 0.5)) / datos.total) * 100).toFixed(2))
          : 0;
        
        return {
          semana,
          presentes: datos.presentes,
          ausentes: datos.ausentes,
          tardanzas: datos.tardanzas,
          porcentaje
        };
      }).sort((a, b) => a.semana.localeCompare(b.semana));

      observer.next(asistenciaSemanal);
      observer.complete();
    });
  }

  getEstudiantesConAsistencia(): Observable<any[]> {
    return new Observable(observer => {
      const usuarios = this.localStorageService.getUsuarios();
      const estudiantes = usuarios.filter(u => u.id_rol === 3);
      const asistencias = this.localStorageService.getAsistencias();
      
      const estudiantesConAsistencia = estudiantes.map(estudiante => {
        const asistenciasEstudiante = asistencias.filter(a => a.id_estudiante === estudiante.id);
        
        const totalClases = asistenciasEstudiante.length;
        const presentes = asistenciasEstudiante.filter(a => a.estado === 'PRESENTE').length;
        const ausentes = asistenciasEstudiante.filter(a => a.estado === 'AUSENTE').length;
        const tardanzas = asistenciasEstudiante.filter(a => a.estado === 'TARDANZA').length;
        
        const porcentajeAsistencia = totalClases > 0 
          ? parseFloat((((presentes + (tardanzas * 0.5)) / totalClases) * 100).toFixed(2))
          : 0;
        
        return {
          id: estudiante.id,
          nombre: estudiante.name,
          legajo: estudiante.legajo,
          totalClases,
          presentes,
          ausentes,
          tardanzas,
          porcentajeAsistencia
        };
      }).filter(e => e.totalClases > 0) // Solo estudiantes con asistencia registrada
        .sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia);

      observer.next(estudiantesConAsistencia);
      observer.complete();
    });
  }

  private getWeekNumber(date: Date): number {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  }
}
