import { Injectable } from '@angular/core';

/**
 * Servicio para cargar datos de demostración en el sistema.
 * Estos datos están diseñados para mostrar todas las alertas del Punto 6 de la exposición.
 */
@Injectable({
  providedIn: 'root'
})
export class CargarDatosDemoService {
  
  constructor() {}

  /**
   * Carga datos de demostración completos para mostrar alertas
   */
  cargarDatosCompletos(): void {
    console.log('🎯 Cargando datos de demostración del Punto 6...');
    
    this.cargarCursos();
    this.cargarEstudiantes();
    this.cargarDocentes();
    this.cargarMaterias();
    this.cargarAsistencias();
    this.cargarAsignaciones();
    
    console.log('✅ Datos de demostración cargados exitosamente');
    console.log('📊 Se generarán las siguientes alertas:');
    console.log('   🔴 3 estudiantes con asistencia crítica (<60%)');
    console.log('   🟡 2 estudiantes con asistencia en advertencia (60-70%)');
    console.log('   🔴 2 docentes sobrecargados (>7 materias)');
    console.log('   🟡 10 docentes con baja carga (<2 materias)');
    console.log('   🔴 10 materias sin asignar');
    console.log('   🔴 Desviación estándar alta (>1.5)');
  }

  /**
   * Limpia todos los datos del sistema
   */
  limpiarDatos(): void {
    const keys = [
      'profesort_estudiantes',
      'profesort_docentes',
      'profesort_materias',
      'profesort_asistencias',
      'profesort_asignaciones',
      'profesort_cursos'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Datos limpiados del localStorage');
  }

  /**
   * Resetea y carga datos frescos
   */
  resetearSistema(): void {
    this.limpiarDatos();
    setTimeout(() => {
      this.cargarDatosCompletos();
      window.location.reload();
    }, 500);
  }

  private cargarEstudiantes(): void {
    const estudiantes = [
      // ESTUDIANTES CRÍTICOS (< 60% asistencia) - GENERAN ALERTAS ROJAS
      {
        id: 1,
        legajo: 'EST001',
        nombre: 'Juan',
        apellido: 'Pérez Problemático',
        email: 'juan.perez@profesort.edu',
        telefono: '3511234567',
        direccion: 'Av. Colón 1234',
        fechaNacimiento: '2005-03-15',
        fechaInscripcion: '2024-03-01',
        estado: 'ACTIVO',
        asistencia: 55.0, // CRÍTICO - Alerta roja
        cursoId: 1
      },
      {
        id: 2,
        legajo: 'EST002',
        nombre: 'María',
        apellido: 'González Ausente',
        email: 'maria.gonzalez@profesort.edu',
        telefono: '3511234568',
        direccion: 'Av. Vélez Sarsfield 567',
        fechaNacimiento: '2005-05-20',
        fechaInscripcion: '2024-03-01',
        estado: 'ACTIVO',
        asistencia: 52.5, // CRÍTICO - Alerta roja
        cursoId: 1
      },
      {
        id: 3,
        legajo: 'EST003',
        nombre: 'Carlos',
        apellido: 'Rodríguez Inasistente',
        email: 'carlos.rodriguez@profesort.edu',
        telefono: '3511234569',
        direccion: 'Bv. San Juan 890',
        fechaNacimiento: '2005-07-10',
        fechaInscripcion: '2024-03-01',
        estado: 'ACTIVO',
        asistencia: 48.0, // CRÍTICO - Alerta roja
        cursoId: 1
      },
      
      // ESTUDIANTES EN ADVERTENCIA (60-70% asistencia) - ALERTAS AMARILLAS
      {
        id: 4,
        legajo: 'EST004',
        nombre: 'Ana',
        apellido: 'Martínez Regular',
        email: 'ana.martinez@profesort.edu',
        telefono: '3511234570',
        direccion: 'Av. Hipólito Yrigoyen 345',
        fechaNacimiento: '2005-02-25',
        fechaInscripcion: '2024-03-01',
        estado: 'ACTIVO',
        asistencia: 67.5, // ADVERTENCIA - Alerta amarilla
        cursoId: 2
      },
      {
        id: 5,
        legajo: 'EST005',
        nombre: 'Luis',
        apellido: 'Fernández Irregular',
        email: 'luis.fernandez@profesort.edu',
        telefono: '3511234571',
        direccion: 'Av. Rafael Núñez 678',
        fechaNacimiento: '2005-09-18',
        fechaInscripcion: '2024-03-01',
        estado: 'ACTIVO',
        asistencia: 62.5, // ADVERTENCIA - Alerta amarilla
        cursoId: 2
      },

      // ESTUDIANTES NORMALES (para promedio realista)
      ...this.generarEstudiantesNormales(25, 6) // 25 estudiantes con 75-95% asistencia
    ];

    localStorage.setItem('profesort_estudiantes', JSON.stringify(estudiantes));
    console.log(`✅ ${estudiantes.length} estudiantes cargados (5 problemáticos, 25 normales)`);
  }

  private generarEstudiantesNormales(cantidad: number, startId: number) {
    const nombres = ['Pedro', 'Lucía', 'Diego', 'Valeria', 'Martín', 'Sofía', 'Sebastián', 'Florencia', 'Nicolás', 'Camila', 'Federico', 'Agustina', 'Tomás', 'Jimena', 'Facundo'];
    const apellidos = ['López', 'García', 'Sánchez', 'Romero', 'Moreno', 'Díaz', 'Torres', 'Vargas', 'Castro', 'Ortiz', 'Silva', 'Méndez', 'Rojas', 'Herrera', 'Medina'];
    
    return Array.from({ length: cantidad }, (_, i) => ({
      id: startId + i,
      legajo: `EST${String(startId + i).padStart(3, '0')}`,
      nombre: nombres[i % nombres.length],
      apellido: apellidos[i % apellidos.length],
      email: `estudiante${startId + i}@profesort.edu`,
      telefono: `351${1000000 + i}`,
      direccion: `Calle ${i + 1} N° ${100 + i}`,
      fechaNacimiento: `2005-${String((i % 12) + 1).padStart(2, '0')}-15`,
      fechaInscripcion: '2024-03-01',
      estado: 'ACTIVO',
      asistencia: 75 + (i % 20), // 75% a 94%
      cursoId: (i % 4) + 1 // Asignar a uno de los 4 cursos
    }));
  }

  private cargarDocentes(): void {
    const docentes = [
      // DOCENTES SOBRECARGADOS (>7 materias) - GENERAN ALERTAS ROJAS
      {
        id: 1,
        legajo: 'DOC001',
        nombre: 'Roberto',
        apellido: 'Martínez Sobrecargado',
        email: 'roberto.martinez@profesort.edu',
        telefono: '3514567890',
        especialidad: 'Matemática',
        titulo: 'Licenciado en Matemática',
        area: 'Exactas',
        fechaIngreso: '2015-03-01',
        estado: 'ACTIVO',
        materias: [] // Se cargará con 8 materias
      },
      {
        id: 2,
        legajo: 'DOC002',
        nombre: 'Laura',
        apellido: 'García Saturada',
        email: 'laura.garcia@profesort.edu',
        telefono: '3514567891',
        especialidad: 'Física',
        titulo: 'Profesora en Física',
        area: 'Exactas',
        fechaIngreso: '2016-03-01',
        estado: 'ACTIVO',
        materias: [] // Se cargará con 7 materias
      },

      // DOCENTES CON BAJA CARGA (<2 materias) - GENERAN ALERTAS AMARILLAS
      ...Array.from({ length: 10 }, (_, i) => ({
        id: i + 3,
        legajo: `DOC${String(i + 3).padStart(3, '0')}`,
        nombre: ['Daniel', 'Patricia', 'Fernando', 'Claudia', 'Gustavo', 'Mónica', 'Ricardo', 'Silvia', 'Jorge', 'Andrea'][i],
        apellido: ['López', 'Rodríguez', 'Pérez', 'González', 'Fernández', 'Díaz', 'Sánchez', 'Romero', 'Torres', 'Vargas'][i] + ' Disponible',
        email: `docente${i + 3}@profesort.edu`,
        telefono: `351456789${i + 2}`,
        especialidad: ['Historia', 'Geografía', 'Biología', 'Química', 'Literatura', 'Inglés', 'Educación Física', 'Música', 'Arte', 'Filosofía'][i],
        titulo: `Profesor/a en ${['Historia', 'Geografía', 'Biología', 'Química', 'Literatura', 'Inglés', 'Educación Física', 'Música', 'Arte', 'Filosofía'][i]}`,
        area: ['Sociales', 'Sociales', 'Naturales', 'Naturales', 'Humanidades', 'Humanidades', 'Humanidades', 'Humanidades', 'Humanidades', 'Humanidades'][i],
        fechaIngreso: '2020-03-01',
        estado: 'ACTIVO',
        materias: [] // Se cargará con 1 materia cada uno
      })),

      // DOCENTES NORMALES (3-5 materias)
      {
        id: 13,
        legajo: 'DOC013',
        nombre: 'Elena',
        apellido: 'Morales Normal',
        email: 'elena.morales@profesort.edu',
        telefono: '3514567903',
        especialidad: 'Informática',
        titulo: 'Licenciada en Sistemas',
        area: 'Exactas',
        fechaIngreso: '2018-03-01',
        estado: 'ACTIVO',
        materias: []
      },
      {
        id: 14,
        legajo: 'DOC014',
        nombre: 'Héctor',
        apellido: 'Vega Equilibrado',
        email: 'hector.vega@profesort.edu',
        telefono: '3514567904',
        especialidad: 'Economía',
        titulo: 'Contador Público',
        area: 'Sociales',
        fechaIngreso: '2017-03-01',
        estado: 'ACTIVO',
        materias: []
      },
      {
        id: 15,
        legajo: 'DOC015',
        nombre: 'Isabel',
        apellido: 'Rojas Estable',
        email: 'isabel.rojas@profesort.edu',
        telefono: '3514567905',
        especialidad: 'Psicología',
        titulo: 'Licenciada en Psicología',
        area: 'Sociales',
        fechaIngreso: '2019-03-01',
        estado: 'ACTIVO',
        materias: []
      }
    ];

    localStorage.setItem('profesort_docentes', JSON.stringify(docentes));
    console.log(`✅ ${docentes.length} docentes cargados (2 sobrecargados, 10 baja carga, 3 normales)`);
  }

  private cargarMaterias(): void {
    const materias = [
      // MATERIAS ASIGNADAS A DOCENTE SOBRECARGADO #1 (Roberto - 8 materias)
      { id: 1, nombre: 'Matemática I', area: 'Exactas', anio: 1, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 1 },
      { id: 2, nombre: 'Matemática II', area: 'Exactas', anio: 2, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 1 },
      { id: 3, nombre: 'Matemática III', area: 'Exactas', anio: 3, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 1 },
      { id: 4, nombre: 'Álgebra I', area: 'Exactas', anio: 1, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 1 },
      { id: 5, nombre: 'Álgebra II', area: 'Exactas', anio: 2, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 1 },
      { id: 6, nombre: 'Geometría', area: 'Exactas', anio: 3, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 1 },
      { id: 7, nombre: 'Trigonometría', area: 'Exactas', anio: 4, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 1 },
      { id: 8, nombre: 'Cálculo I', area: 'Exactas', anio: 5, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 1 },

      // MATERIAS ASIGNADAS A DOCENTE SOBRECARGADO #2 (Laura - 7 materias)
      { id: 9, nombre: 'Física I', area: 'Exactas', anio: 1, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 2 },
      { id: 10, nombre: 'Física II', area: 'Exactas', anio: 2, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 2 },
      { id: 11, nombre: 'Física III', area: 'Exactas', anio: 3, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: 2 },
      { id: 12, nombre: 'Mecánica', area: 'Exactas', anio: 4, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: 2 },
      { id: 13, nombre: 'Electricidad', area: 'Exactas', anio: 4, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 2 },
      { id: 14, nombre: 'Óptica', area: 'Exactas', anio: 5, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 2 },
      { id: 15, nombre: 'Termodinámica', area: 'Exactas', anio: 5, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 2 },

      // MATERIAS CON BAJA CARGA (1 materia por docente - IDs 3-12)
      { id: 16, nombre: 'Historia Argentina', area: 'Sociales', anio: 2, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 3 },
      { id: 17, nombre: 'Geografía Física', area: 'Sociales', anio: 1, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 4 },
      { id: 18, nombre: 'Biología General', area: 'Naturales', anio: 1, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 5 },
      { id: 19, nombre: 'Química Orgánica', area: 'Naturales', anio: 2, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 6 },
      { id: 20, nombre: 'Literatura Española', area: 'Humanidades', anio: 3, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 7 },
      { id: 21, nombre: 'Inglés Técnico', area: 'Humanidades', anio: 4, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 8 },
      { id: 22, nombre: 'Educación Física', area: 'Humanidades', anio: 1, division: 'C', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 9 },
      { id: 23, nombre: 'Música Coral', area: 'Humanidades', anio: 2, division: 'C', turno: 'TARDE', estado: 'ACTIVA', docenteId: 10 },
      { id: 24, nombre: 'Arte y Cultura', area: 'Humanidades', anio: 3, division: 'C', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 11 },
      { id: 25, nombre: 'Filosofía I', area: 'Humanidades', anio: 4, division: 'C', turno: 'TARDE', estado: 'ACTIVA', docenteId: 12 },

      // MATERIAS DOCENTES NORMALES (3-4 materias cada uno)
      { id: 26, nombre: 'Programación I', area: 'Exactas', anio: 3, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 13 },
      { id: 27, nombre: 'Programación II', area: 'Exactas', anio: 4, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 13 },
      { id: 28, nombre: 'Base de Datos', area: 'Exactas', anio: 5, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: 13 },
      
      { id: 29, nombre: 'Economía I', area: 'Sociales', anio: 3, division: 'B', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 14 },
      { id: 30, nombre: 'Economía II', area: 'Sociales', anio: 4, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 14 },
      { id: 31, nombre: 'Contabilidad', area: 'Sociales', anio: 5, division: 'B', turno: 'TARDE', estado: 'ACTIVA', docenteId: 14 },
      
      { id: 32, nombre: 'Psicología General', area: 'Sociales', anio: 2, division: 'C', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 15 },
      { id: 33, nombre: 'Psicología Social', area: 'Sociales', anio: 3, division: 'C', turno: 'TARDE', estado: 'ACTIVA', docenteId: 15 },
      { id: 34, nombre: 'Desarrollo Humano', area: 'Sociales', anio: 4, division: 'C', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: 15 },
      { id: 35, nombre: 'Orientación Vocacional', area: 'Sociales', anio: 5, division: 'C', turno: 'TARDE', estado: 'ACTIVA', docenteId: 15 },

      // *** MATERIAS SIN ASIGNAR (10 materias) - GENERAN ALERTA ROJA CRÍTICA ***
      { id: 36, nombre: 'Química Inorgánica', area: 'Naturales', anio: 3, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: null },
      { id: 37, nombre: 'Biología Molecular', area: 'Naturales', anio: 4, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: null },
      { id: 38, nombre: 'Anatomía Humana', area: 'Naturales', anio: 5, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: null },
      { id: 39, nombre: 'Filosofía II', area: 'Humanidades', anio: 5, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: null },
      { id: 40, nombre: 'Ética y Ciudadanía', area: 'Humanidades', anio: 5, division: 'B', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: null },
      { id: 41, nombre: 'Antropología', area: 'Sociales', anio: 4, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: null },
      { id: 42, nombre: 'Sociología', area: 'Sociales', anio: 5, division: 'A', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: null },
      { id: 43, nombre: 'Teatro y Expresión', area: 'Humanidades', anio: 2, division: 'A', turno: 'TARDE', estado: 'ACTIVA', docenteId: null },
      { id: 44, nombre: 'Historia del Arte', area: 'Humanidades', anio: 3, division: 'B', turno: 'MAÑANA', estado: 'ACTIVA', docenteId: null },
      { id: 45, nombre: 'Astronomía', area: 'Exactas', anio: 5, division: 'C', turno: 'TARDE', estado: 'ACTIVA', docenteId: null }
    ];

    localStorage.setItem('profesort_materias', JSON.stringify(materias));
    console.log(`✅ ${materias.length} materias cargadas (35 asignadas, 10 SIN ASIGNAR)`);
  }

  private cargarAsistencias(): void {
    // Generar asistencias para los últimos 45 días para tener más datos
    const asistencias: any[] = [];
    const estudiantes = JSON.parse(localStorage.getItem('profesort_estudiantes') || '[]');
    const today = new Date();
    
    for (let day = 0; day < 45; day++) {
      const fecha = new Date(today);
      fecha.setDate(fecha.getDate() - day);
      
      // Omitir fines de semana
      if (fecha.getDay() === 0 || fecha.getDay() === 6) continue;
      
      estudiantes.forEach((est: any) => {
        const random = Math.random() * 100;
        let estado;
        
        // Usar el porcentaje de asistencia del estudiante para determinar presencias
        if (random < est.asistencia) {
          estado = 'PRESENTE';
        } else if (random < est.asistencia + 5) { // Reducir la probabilidad de tardanza
          estado = 'TARDANZA';
        } else {
          estado = 'AUSENTE';
        }
        
        asistencias.push({
          id: asistencias.length + 1,
          estudianteId: est.id,
          estudianteLegajo: est.legajo,
          estudianteNombre: `${est.nombre} ${est.apellido}`,
          fecha: fecha.toISOString().split('T')[0],
          estado: estado,
          observaciones: estado === 'AUSENTE' ? 'Sin justificativo' : ''
        });
      });
    }

    localStorage.setItem('profesort_asistencias', JSON.stringify(asistencias));
    console.log(`✅ ${asistencias.length} registros de asistencia generados (últimos 45 días)`);
  }

  private cargarAsignaciones(): void {
    const docentes = JSON.parse(localStorage.getItem('profesort_docentes') || '[]') || [];
    const materias = JSON.parse(localStorage.getItem('profesort_materias') || '[]') || [];
    
    // Actualizar arrays de materias en cada docente
    if(docentes.length > 0) {
      docentes.forEach((docente: any) => {
        docente.materias = materias
          .filter((m: any) => m.docenteId === docente.id)
          .map((m: any) => m.id);
      });
    }
    
    localStorage.setItem('profesort_docentes', JSON.stringify(docentes));
    console.log(`✅ Asignaciones actualizadas en docentes`);
  }

  private cargarCursos(): void {
    const cursos = [
      { 
        id: 1, 
        nombre: '1° Año A', 
        anio: 1, 
        division: 'A', 
        turno: 'MAÑANA', 
        cantEstudiantes: 0,
        estudiantes: [1, 2, 3, 4, 5, 6, 7, 8],
        activo: true
      },
      { 
        id: 2, 
        nombre: '1° Año B', 
        anio: 1, 
        division: 'B', 
        turno: 'TARDE', 
        cantEstudiantes: 0,
        estudiantes: [9, 10, 11, 12, 13, 14, 15, 16],
        activo: true
      },
      { 
        id: 3, 
        nombre: '2° Año A', 
        anio: 2, 
        division: 'A', 
        turno: 'MAÑANA', 
        cantEstudiantes: 0,
        estudiantes: [17, 18, 19, 20, 21, 22, 23, 24],
        activo: true
      },
      { 
        id: 4, 
        nombre: '2° Año B', 
        anio: 2, 
        division: 'B', 
        turno: 'NOCHE', 
        cantEstudiantes: 0,
        estudiantes: [25, 26, 27, 28, 29, 30],
        activo: true
      }
    ];

    // Calcular cantidad de estudiantes después de que los cursos estén definidos
    setTimeout(() => {
      const estudiantes = JSON.parse(localStorage.getItem('profesort_estudiantes') || '[]') || [];
      cursos.forEach(curso => {
        curso.cantEstudiantes = curso.estudiantes?.length || 0;
      });
      localStorage.setItem('profesort_cursos', JSON.stringify(cursos));
    }, 100);

    localStorage.setItem('profesort_cursos', JSON.stringify(cursos));
    console.log(`✅ ${cursos.length} cursos cargados con estudiantes asignados`);
  }
}