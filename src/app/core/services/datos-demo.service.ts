import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

/**
 * Servicio para cargar datos de demostración que generan alertas específicas
 * para la exposición del Punto 6 - Toma de Decisiones Basada en Datos
 */
@Injectable({
  providedIn: 'root'
})
export class DatosDemoService {

  constructor(private localStorageService: LocalStorageService) {}

  /**
   * Carga el conjunto completo de datos de demostración
   * que generará múltiples alertas para la exposición
   */
  cargarDatosDemo(): void {
    console.log('🔄 Cargando datos de demostración...');
    
    // Limpiar datos existentes
    this.limpiarDatos();
    
    // Cargar cada conjunto de datos
    this.cargarAreas();
    this.cargarDocentes();
    this.cargarEstudiantes();
    this.cargarMaterias();
    this.cargarAsignaciones();
    this.cargarAsistencias();
    
    console.log('✅ Datos de demostración cargados correctamente');
    console.log('📊 Alertas esperadas:');
    console.log('   - 3 alertas críticas de asistencia (< 60%)');
    console.log('   - 2 alertas de asistencia regular (60-70%)');
    console.log('   - 2 alertas de docentes sobrecargados (> 6 materias)');
    console.log('   - 2 alertas de docentes subutilizados (1-2 materias)');
    console.log('   - 1 alerta de materias sin asignar (10 materias)');
    console.log('   - 1 alerta de desviación estándar alta (σ > 2.0)');
  }

  /**
   * Limpia todos los datos del localStorage
   */
  private limpiarDatos(): void {
    localStorage.removeItem('profesort_usuarios');
    localStorage.removeItem('profesort_materias');
    localStorage.removeItem('profesort_asignaciones');
    localStorage.removeItem('profesort_asistencias');
    console.log('🗑️ Datos anteriores eliminados');
  }

  /**
   * Carga las áreas de conocimiento
   */
  private cargarAreas(): void {
    const areas = [
      { id: 1, nombre: 'EXACTAS', color: '#4CAF50' },
      { id: 2, nombre: 'SOCIALES', color: '#2196F3' },
      { id: 3, nombre: 'NATURALES', color: '#FF9800' },
      { id: 4, nombre: 'HUMANIDADES', color: '#9C27B0' }
    ];
    
    // Las áreas se almacenan como parte de los docentes y materias
    console.log('📋 Áreas configuradas:', areas.length);
  }

  /**
   * Carga los docentes con distribución desigual de carga académica
   */
  private cargarDocentes(): void {
    const docentes = [
      // Docentes sobrecargados (generan alertas críticas)
      {
        id: 101,
        name: 'Roberto García Martínez',
        email: 'roberto.garcia@profesort.edu',
        id_rol: 2,
        area: 'EXACTAS',
        estado: 'ACTIVO'
      },
      {
        id: 102,
        name: 'Laura Fernández López',
        email: 'laura.fernandez@profesort.edu',
        id_rol: 2,
        area: 'SOCIALES',
        estado: 'ACTIVO'
      },
      // Docentes subutilizados (generan alertas de advertencia)
      {
        id: 103,
        name: 'Daniel Rodríguez Sánchez',
        email: 'daniel.rodriguez@profesort.edu',
        id_rol: 2,
        area: 'NATURALES',
        estado: 'ACTIVO'
      },
      {
        id: 104,
        name: 'Patricia Gómez Ruiz',
        email: 'patricia.gomez@profesort.edu',
        id_rol: 2,
        area: 'HUMANIDADES',
        estado: 'ACTIVO'
      },
      // Docentes con carga normal
      {
        id: 105,
        name: 'Carlos Martín Pérez',
        email: 'carlos.martin@profesort.edu',
        id_rol: 2,
        area: 'EXACTAS',
        estado: 'ACTIVO'
      },
      {
        id: 106,
        name: 'Ana María Torres Díaz',
        email: 'ana.torres@profesort.edu',
        id_rol: 2,
        area: 'SOCIALES',
        estado: 'ACTIVO'
      },
      {
        id: 107,
        name: 'Miguel Ángel Silva Castro',
        email: 'miguel.silva@profesort.edu',
        id_rol: 2,
        area: 'NATURALES',
        estado: 'ACTIVO'
      },
      {
        id: 108,
        name: 'Isabel Ramírez Moreno',
        email: 'isabel.ramirez@profesort.edu',
        id_rol: 2,
        area: 'HUMANIDADES',
        estado: 'ACTIVO'
      }
    ];

    // Agregar usuario admin
    const admin = {
      id: 1,
      name: 'Administrador Sistema',
      email: 'admin@profesort.edu',
      id_rol: 1,
      estado: 'ACTIVO'
    };

    const todosUsuarios = [admin, ...docentes];
    localStorage.setItem('profesort_usuarios', JSON.stringify(todosUsuarios));
    console.log('👨‍🏫 Docentes cargados:', docentes.length);
  }

  /**
   * Carga estudiantes con diferentes niveles de asistencia
   */
  private cargarEstudiantes(): void {
    const estudiantes = [
      // Estudiantes con asistencia CRÍTICA (< 60%) - 3 alertas críticas
      {
        id: 201,
        name: 'Juan Manuel Pérez',
        legajo: 'EST001',
        email: 'juan.perez@estudiante.edu',
        id_rol: 3,
        estado: 'ACTIVO'
      },
      {
        id: 202,
        name: 'María del Carmen González',
        legajo: 'EST002',
        email: 'maria.gonzalez@estudiante.edu',
        id_rol: 3,
        estado: 'ACTIVO'
      },
      {
        id: 203,
        name: 'Carlos Alberto Ramírez',
        legajo: 'EST003',
        email: 'carlos.ramirez@estudiante.edu',
        id_rol: 3,
        estado: 'ACTIVO'
      },
      // Estudiantes con asistencia REGULAR (60-70%) - 2 alertas de advertencia
      {
        id: 204,
        name: 'Ana Sofía Martínez',
        legajo: 'EST004',
        email: 'ana.martinez@estudiante.edu',
        id_rol: 3,
        estado: 'ACTIVO'
      },
      {
        id: 205,
        name: 'Luis Fernando Torres',
        legajo: 'EST005',
        email: 'luis.torres@estudiante.edu',
        id_rol: 3,
        estado: 'ACTIVO'
      },
      // Estudiantes con buena asistencia (para promedio realista)
      ...Array.from({ length: 15 }, (_, i) => ({
        id: 206 + i,
        name: `Estudiante Ejemplo ${i + 6}`,
        legajo: `EST${String(i + 6).padStart(3, '0')}`,
        email: `estudiante${i + 6}@estudiante.edu`,
        id_rol: 3,
        estado: 'ACTIVO'
      }))
    ];

    // Agregar a usuarios existentes
    const usuariosActuales = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
    const todosUsuarios = [...usuariosActuales, ...estudiantes];
    localStorage.setItem('profesort_usuarios', JSON.stringify(todosUsuarios));
    console.log('👨‍🎓 Estudiantes cargados:', estudiantes.length);
  }

  /**
   * Carga materias con algunas sin asignar
   */
  private cargarMaterias(): void {
    const materias = [
      // EXACTAS - 10 materias (8 asignadas)
      { id: 301, codigo: 'MAT101', nombre: 'Matemática I', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 302, codigo: 'FIS101', nombre: 'Física I', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 303, codigo: 'QUI101', nombre: 'Química General', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 304, codigo: 'MAT201', nombre: 'Matemática II', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 305, codigo: 'FIS201', nombre: 'Física II', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 306, codigo: 'QUI201', nombre: 'Química Orgánica', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 307, codigo: 'MAT301', nombre: 'Cálculo Avanzado', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 308, codigo: 'EST101', nombre: 'Estadística I', area: 'EXACTAS', estado: 'ACTIVO' },
      { id: 309, codigo: 'QUI301', nombre: 'Química Analítica', area: 'EXACTAS', estado: 'ACTIVO' }, // SIN ASIGNAR
      { id: 310, codigo: 'FIS301', nombre: 'Física Cuántica', area: 'EXACTAS', estado: 'ACTIVO' }, // SIN ASIGNAR
      
      // SOCIALES - 10 materias (8 asignadas)
      { id: 311, codigo: 'HIS101', nombre: 'Historia Argentina', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 312, codigo: 'GEO101', nombre: 'Geografía Mundial', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 313, codigo: 'ECO101', nombre: 'Economía I', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 314, codigo: 'CIU101', nombre: 'Educación Ciudadana', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 315, codigo: 'HIS201', nombre: 'Historia Universal', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 316, codigo: 'ECO201', nombre: 'Economía II', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 317, codigo: 'SOC101', nombre: 'Sociología', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 318, codigo: 'PSI101', nombre: 'Psicología', area: 'SOCIALES', estado: 'ACTIVO' },
      { id: 319, codigo: 'GEO201', nombre: 'Geografía Económica', area: 'SOCIALES', estado: 'ACTIVO' }, // SIN ASIGNAR
      { id: 320, codigo: 'ANT101', nombre: 'Antropología', area: 'SOCIALES', estado: 'ACTIVO' }, // SIN ASIGNAR
      
      // NATURALES - 10 materias (7 asignadas)
      { id: 321, codigo: 'BIO101', nombre: 'Biología General', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 322, codigo: 'BIO201', nombre: 'Biología Celular', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 323, codigo: 'BIO301', nombre: 'Genética', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 324, codigo: 'ECO301', nombre: 'Ecología', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 325, codigo: 'BOT101', nombre: 'Botánica', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 326, codigo: 'ZOO101', nombre: 'Zoología', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 327, codigo: 'MIC101', nombre: 'Microbiología', area: 'NATURALES', estado: 'ACTIVO' },
      { id: 328, codigo: 'BIO401', nombre: 'Biología Molecular', area: 'NATURALES', estado: 'ACTIVO' }, // SIN ASIGNAR
      { id: 329, codigo: 'BIQ101', nombre: 'Bioquímica', area: 'NATURALES', estado: 'ACTIVO' }, // SIN ASIGNAR
      { id: 330, codigo: 'GEO301', nombre: 'Geología', area: 'NATURALES', estado: 'ACTIVO' }, // SIN ASIGNAR
      
      // HUMANIDADES - 10 materias (7 asignadas)
      { id: 331, codigo: 'LIT101', nombre: 'Literatura Universal', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 332, codigo: 'FIL101', nombre: 'Filosofía I', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 333, codigo: 'ART101', nombre: 'Historia del Arte', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 334, codigo: 'MUS101', nombre: 'Educación Musical', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 335, codigo: 'LIT201', nombre: 'Literatura Argentina', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 336, codigo: 'FIL201', nombre: 'Filosofía II', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 337, codigo: 'TET101', nombre: 'Teatro', area: 'HUMANIDADES', estado: 'ACTIVO' },
      { id: 338, codigo: 'FIL301', nombre: 'Ética', area: 'HUMANIDADES', estado: 'ACTIVO' }, // SIN ASIGNAR
      { id: 339, codigo: 'ART201', nombre: 'Arte Contemporáneo', area: 'HUMANIDADES', estado: 'ACTIVO' }, // SIN ASIGNAR
      { id: 340, codigo: 'MUS201', nombre: 'Teoría Musical', area: 'HUMANIDADES', estado: 'ACTIVO' } // SIN ASIGNAR
    ];

    localStorage.setItem('profesort_materias', JSON.stringify(materias));
    console.log('📚 Materias cargadas:', materias.length);
    console.log('   - 10 materias SIN ASIGNAR (generará alerta crítica)');
  }

  /**
   * Carga asignaciones de materias a docentes
   * Distribución desigual para generar alertas
   */
  private cargarAsignaciones(): void {
    const asignaciones = [
      // Roberto García (ID 101) - SOBRECARGADO con 8 materias
      { id: 1, id_usuario: 101, id_materia: 301, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 2, id_usuario: 101, id_materia: 302, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 3, id_usuario: 101, id_materia: 303, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 4, id_usuario: 101, id_materia: 304, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 5, id_usuario: 101, id_materia: 305, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 6, id_usuario: 101, id_materia: 306, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 7, id_usuario: 101, id_materia: 307, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 8, id_usuario: 101, id_materia: 308, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Laura Fernández (ID 102) - SOBRECARGADA con 7 materias
      { id: 9, id_usuario: 102, id_materia: 311, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 10, id_usuario: 102, id_materia: 312, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 11, id_usuario: 102, id_materia: 313, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 12, id_usuario: 102, id_materia: 314, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 13, id_usuario: 102, id_materia: 315, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 14, id_usuario: 102, id_materia: 316, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 15, id_usuario: 102, id_materia: 317, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Daniel Rodríguez (ID 103) - SUBUTILIZADO con 1 materia
      { id: 16, id_usuario: 103, id_materia: 321, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Patricia Gómez (ID 104) - SUBUTILIZADA con 1 materia
      { id: 17, id_usuario: 104, id_materia: 331, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Carlos Martín (ID 105) - Carga normal con 3 materias
      { id: 18, id_usuario: 105, id_materia: 322, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 19, id_usuario: 105, id_materia: 323, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 20, id_usuario: 105, id_materia: 324, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Ana María Torres (ID 106) - Carga normal con 4 materias
      { id: 21, id_usuario: 106, id_materia: 318, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 22, id_usuario: 106, id_materia: 332, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 23, id_usuario: 106, id_materia: 333, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 24, id_usuario: 106, id_materia: 334, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Miguel Ángel Silva (ID 107) - Carga normal con 3 materias
      { id: 25, id_usuario: 107, id_materia: 325, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 26, id_usuario: 107, id_materia: 326, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 27, id_usuario: 107, id_materia: 327, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      
      // Isabel Ramírez (ID 108) - Carga normal con 4 materias
      { id: 28, id_usuario: 108, id_materia: 335, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 29, id_usuario: 108, id_materia: 336, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' },
      { id: 30, id_usuario: 108, id_materia: 337, estado: 'ACTIVO', fecha_asignacion: '2025-01-15' }
      
      // 10 materias quedan SIN ASIGNAR: 309, 310, 319, 320, 328, 329, 330, 338, 339, 340
    ];

    localStorage.setItem('profesort_asignaciones', JSON.stringify(asignaciones));
    console.log('📎 Asignaciones cargadas:', asignaciones.length);
    console.log('   - Roberto García: 8 materias (SOBRECARGADO)');
    console.log('   - Laura Fernández: 7 materias (SOBRECARGADA)');
    console.log('   - Daniel Rodríguez: 1 materia (SUBUTILIZADO)');
    console.log('   - Patricia Gómez: 1 materia (SUBUTILIZADA)');
    console.log('   - Desviación estándar esperada: > 2.0 (CRÍTICA)');
  }

  /**
   * Carga registros de asistencia con diferentes porcentajes
   */
  private cargarAsistencias(): void {
    const asistencias: any[] = [];
    const fechaBase = new Date('2025-10-01');
    let idAsistencia = 1;

    // Estudiantes con asistencia crítica (< 60%)
    const estudiantesCriticos = [
      { id: 201, nombre: 'Juan Manuel Pérez', porcentaje: 0.55 },      // 55%
      { id: 202, nombre: 'María del Carmen González', porcentaje: 0.525 }, // 52.5%
      { id: 203, nombre: 'Carlos Alberto Ramírez', porcentaje: 0.575 }     // 57.5%
    ];

    // Estudiantes con asistencia regular (60-70%)
    const estudiantesRegulares = [
      { id: 204, nombre: 'Ana Sofía Martínez', porcentaje: 0.675 },  // 67.5%
      { id: 205, nombre: 'Luis Fernando Torres', porcentaje: 0.625 }  // 62.5%
    ];

    // Estudiantes con buena asistencia (80-95%)
    const estudiantesBuenos = Array.from({ length: 15 }, (_, i) => ({
      id: 206 + i,
      nombre: `Estudiante Ejemplo ${i + 6}`,
      porcentaje: 0.80 + (Math.random() * 0.15) // 80-95%
    }));

    // Generar 40 registros de asistencia por estudiante
    const totalClases = 40;
    const todosEstudiantes = [...estudiantesCriticos, ...estudiantesRegulares, ...estudiantesBuenos];

    todosEstudiantes.forEach(estudiante => {
      const clasesAsistidas = Math.floor(totalClases * estudiante.porcentaje);
      
      for (let i = 0; i < totalClases; i++) {
        const fecha = new Date(fechaBase);
        fecha.setDate(fecha.getDate() + i);
        
        asistencias.push({
          id: idAsistencia++,
          id_usuario: estudiante.id,
          id_materia: 301, // Usar una materia de referencia
          fecha: fecha.toISOString().split('T')[0],
          estado: i < clasesAsistidas ? 'PRESENTE' : 'AUSENTE',
          observaciones: i < clasesAsistidas ? '' : 'Ausencia sin justificar'
        });
      }
    });

    localStorage.setItem('profesort_asistencias', JSON.stringify(asistencias));
    console.log('📅 Asistencias cargadas:', asistencias.length);
    console.log('   - Juan Manuel Pérez: 55% (CRÍTICO)');
    console.log('   - María González: 52.5% (CRÍTICO)');
    console.log('   - Carlos Ramírez: 57.5% (CRÍTICO)');
    console.log('   - Ana Martínez: 67.5% (REGULAR)');
    console.log('   - Luis Torres: 62.5% (REGULAR)');
  }

  /**
   * Restaura los datos originales (limpia los datos demo)
   */
  restaurarDatosOriginales(): void {
    this.limpiarDatos();
    console.log('♻️ Datos de demostración eliminados');
    console.log('💡 Recarga la aplicación para usar tus datos reales');
  }
}
