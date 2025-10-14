import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Cargar datos demo automáticamente si no existen
function cargarDatosDemoAutomatico() {
  const asistencias = localStorage.getItem('profesort_asistencias');
  const materias = localStorage.getItem('profesort_materias');
  
  // Solo cargar si no hay datos de asistencias o materias
  if (!asistencias || !materias || JSON.parse(asistencias).length === 0) {
    console.log('📊 Cargando datos demo para estadísticas...');
    
    // Materias demo
    const materiasDemo = [
      { id: 1, nombre: 'Matemática I', area: 'EXACTAS', codigo: 'MAT01', año: 1, cuatrimestre: 1 },
      { id: 2, nombre: 'Lengua y Literatura', area: 'LENGUA', codigo: 'LEN01', año: 1, cuatrimestre: 1 },
      { id: 3, nombre: 'Historia Argentina', area: 'SOCIALES', codigo: 'HIS01', año: 1, cuatrimestre: 1 },
      { id: 4, nombre: 'Biología', area: 'NATURALES', codigo: 'BIO01', año: 1, cuatrimestre: 2 },
      { id: 5, nombre: 'Física I', area: 'EXACTAS', codigo: 'FIS01', año: 2, cuatrimestre: 1 },
      { id: 6, nombre: 'Literatura', area: 'LENGUA', codigo: 'LIT01', año: 2, cuatrimestre: 1 },
      { id: 7, nombre: 'Geografía Mundial', area: 'SOCIALES', codigo: 'GEO01', año: 2, cuatrimestre: 2 },
      { id: 8, nombre: 'Química General', area: 'EXACTAS', codigo: 'QUI01', año: 2, cuatrimestre: 2 },
      { id: 9, nombre: 'Inglés I', area: 'LENGUA', codigo: 'ING01', año: 1, cuatrimestre: 1 },
      { id: 10, nombre: 'Educación Física', area: 'EDUCACION_FISICA', codigo: 'EDF01', año: 1, cuatrimestre: 1 },
      { id: 11, nombre: 'Biología General', area: 'EXACTAS', codigo: 'BIO02', año: 2, cuatrimestre: 1 },
      { id: 12, nombre: 'Educación Ciudadana', area: 'SOCIALES', codigo: 'EDC01', año: 3, cuatrimestre: 1 },
      { id: 13, nombre: 'Educación Tecnológica 1', area: 'TECNOLOGIA', codigo: 'TEC01', año: 1, cuatrimestre: 2 },
      { id: 14, nombre: 'Educación Tecnológica 2', area: 'TECNOLOGIA', codigo: 'TEC02', año: 2, cuatrimestre: 1 }
    ];
    localStorage.setItem('profesort_materias', JSON.stringify(materiasDemo));

    // Generar asistencias variadas para los últimos 10 días
    const estados = ['PRESENTE', 'AUSENTE', 'TARDANZA'];
    const asistenciasDemo: any[] = [];
    let id = 1;
    
    for (let d = 1; d <= 10; d++) {
      const fecha = `2025-10-${d.toString().padStart(2, '0')}`;
      
      // Generar asistencias para algunas materias cada día
      [1, 2, 3, 4, 5, 6, 7, 8].forEach(materiaId => {
        // Simular 5-8 estudiantes por materia
        const numEstudiantes = Math.floor(Math.random() * 4) + 5;
        
        for (let e = 1; e <= numEstudiantes; e++) {
          // 70% presente, 20% ausente, 10% tardanza
          const random = Math.random();
          let estado;
          if (random < 0.7) estado = 'PRESENTE';
          else if (random < 0.9) estado = 'AUSENTE';
          else estado = 'TARDANZA';
          
          asistenciasDemo.push({
            id: id++,
            id_estudiante: e,
            id_materia: materiaId,
            id_docente: 1,
            fecha: fecha,
            estado: estado,
            observaciones: '',
            created_at: fecha + 'T08:00:00Z'
          });
        }
      });
    }
    
    localStorage.setItem('profesort_asistencias', JSON.stringify(asistenciasDemo));
    console.log(`✅ Datos demo cargados: ${materiasDemo.length} materias, ${asistenciasDemo.length} registros de asistencia`);
  }
}

// Ejecutar carga de datos antes de iniciar la app
cargarDatosDemoAutomatico();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
