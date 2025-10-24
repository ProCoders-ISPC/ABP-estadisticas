/**
 * SCRIPT DE RESET COMPLETO - ProfeSort
 * Ejecuta: resetData() en la consola del navegador
 * 
 * Este script limpia completamente el localStorage y carga:
 * - 1 Administrador
 * - 8 Docentes (2 sobrecargados, 2 subutilizados, 4 normales)
 * - 20 Estudiantes (3 con asistencia crítica, 2 regular, 15 buena)
 * - 40 Materias (40 asignadas, generando alertas de distribución)
 * - Asignaciones de materias a docentes (distribuidas inequitativamente)
 * - 800+ registros de asistencia con varios meses de datos
 */

window.resetData = function() {
  if (!confirm('⚠️ ADVERTENCIA: Esto borrará TODOS los datos del localStorage y cargará datos de demostración.\n\n¿Deseas continuar?')) {
    console.log('❌ Operación cancelada');
    return;
  }

  console.clear();
  console.log('🔄 Iniciando reset completo del sistema...');
  console.log('═'.repeat(60));

  try {
    // 1. LIMPIAR TODO
    console.log('\n🗑️ PASO 1: Limpiando localStorage...');
    localStorage.clear();
    console.log('✅ LocalStorage limpio');

    // 2. CREAR DATOS DE REFERENCIA
    console.log('\n📊 PASO 2: Creando datos de referencia...');
    
    const areas = [
      { id: 1, nombre: 'EXACTAS', color: '#4CAF50' },
      { id: 2, nombre: 'SOCIALES', color: '#2196F3' },
      { id: 3, nombre: 'NATURALES', color: '#FF9800' },
      { id: 4, nombre: 'HUMANIDADES', color: '#9C27B0' },
      { id: 5, nombre: 'EDUCACION_FISICA', color: '#00BCD4' },
      { id: 6, nombre: 'LENGUA', color: '#E91E63' },
      { id: 7, nombre: 'TECNOLOGIA', color: '#673AB7' }
    ];
    console.log(`✅ ${areas.length} áreas configuradas`);

    // 3. CREAR USUARIOS (ADMIN + DOCENTES + ESTUDIANTES)
    console.log('\n👥 PASO 3: Creando usuarios...');
    
    const usuarios = [];
    
    // Admin
    usuarios.push({
      id: 1,
      name: 'Administrador Sistema',
      email: 'admin@profesort.edu',
      id_rol: 1,
      legajo: 'ADMIN001',
      dni: '12345678',
      estado: 'ACTIVO'
    });

    // 8 Docentes
    const docentes = [
      // SOBRECARGADOS (generan alertas críticas)
      {
        id: 2,
        name: 'Roberto García Martínez',
        email: 'roberto.garcia@profesort.edu',
        id_rol: 2,
        area: 'EXACTAS',
        legajo: 'DOC001',
        dni: '28456789',
        estado: 'ACTIVO'
      },
      {
        id: 3,
        name: 'Laura Fernández López',
        email: 'laura.fernandez@profesort.edu',
        id_rol: 2,
        area: 'SOCIALES',
        legajo: 'DOC002',
        dni: '29567890',
        estado: 'ACTIVO'
      },
      // SUBUTILIZADOS (generan alertas de advertencia)
      {
        id: 4,
        name: 'Daniel Rodríguez Sánchez',
        email: 'daniel.rodriguez@profesort.edu',
        id_rol: 2,
        area: 'NATURALES',
        legajo: 'DOC003',
        dni: '30678901',
        estado: 'ACTIVO'
      },
      {
        id: 5,
        name: 'Patricia Gómez Ruiz',
        email: 'patricia.gomez@profesort.edu',
        id_rol: 2,
        area: 'HUMANIDADES',
        legajo: 'DOC004',
        dni: '31789012',
        estado: 'ACTIVO'
      },
      // NORMALES
      {
        id: 6,
        name: 'Carlos Martín Pérez',
        email: 'carlos.martin@profesort.edu',
        id_rol: 2,
        area: 'EXACTAS',
        legajo: 'DOC005',
        dni: '32890123',
        estado: 'ACTIVO'
      },
      {
        id: 7,
        name: 'Ana María Torres Díaz',
        email: 'ana.torres@profesort.edu',
        id_rol: 2,
        area: 'SOCIALES',
        legajo: 'DOC006',
        dni: '33901234',
        estado: 'ACTIVO'
      },
      {
        id: 8,
        name: 'Miguel Ángel Silva Castro',
        email: 'miguel.silva@profesort.edu',
        id_rol: 2,
        area: 'NATURALES',
        legajo: 'DOC007',
        dni: '34012345',
        estado: 'ACTIVO'
      },
      {
        id: 9,
        name: 'Isabel Ramírez Moreno',
        email: 'isabel.ramirez@profesort.edu',
        id_rol: 2,
        area: 'HUMANIDADES',
        legajo: 'DOC008',
        dni: '35123456',
        estado: 'ACTIVO'
      }
    ];

    // 20 Estudiantes
    const estudiantes = [];
    for (let i = 0; i < 20; i++) {
      const id = 10 + i;
      const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'José', 'Rosa', 'Pedro', 'Sofía',
                       'Andrés', 'Lucia', 'Miguel', 'Gabriela', 'Diego', 'Valentina', 'Felipe', 'Martina', 'Rafael', 'Camila'];
      const apellidos = ['García', 'López', 'Martínez', 'Rodríguez', 'Fernández', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
                        'Castro', 'Morales', 'Romero', 'Flores', 'Silva', 'Benitez', 'Herrera', 'Mendez', 'Aguirre', 'Diaz'];
      
      estudiantes.push({
        id: id,
        name: `${nombres[i]} ${apellidos[i]}`,
        email: `estudiante${i+1}@mail.com`,
        id_rol: 3,
        legajo: `EST${String(i+1).padStart(3, '0')}`,
        dni: `4${String(2000000 + i).slice(-7)}`,
        estado: 'ACTIVO'
      });
    }

    usuarios.push(...docentes, ...estudiantes);
    localStorage.setItem('profesort_usuarios', JSON.stringify(usuarios));
    console.log(`✅ ${usuarios.length} usuarios creados (1 admin, 8 docentes, 20 estudiantes)`);

    // 4. CREAR MATERIAS (40 materias)
    console.log('\n📚 PASO 4: Creando materias...');
    
    const materias = [];
    const materiasConf = [
      // EXACTAS (10)
      { codigo: 'MAT101', nombre: 'Matemática I', area: 'EXACTAS' },
      { codigo: 'MAT102', nombre: 'Matemática II', area: 'EXACTAS' },
      { codigo: 'FIS101', nombre: 'Física I', area: 'EXACTAS' },
      { codigo: 'FIS102', nombre: 'Física II', area: 'EXACTAS' },
      { codigo: 'QUI101', nombre: 'Química General', area: 'EXACTAS' },
      { codigo: 'QUI102', nombre: 'Química Orgánica', area: 'EXACTAS' },
      { codigo: 'EST101', nombre: 'Estadística I', area: 'EXACTAS' },
      { codigo: 'EST102', nombre: 'Estadística II', area: 'EXACTAS' },
      { codigo: 'ALG101', nombre: 'Álgebra Lineal', area: 'EXACTAS' },
      { codigo: 'CAL101', nombre: 'Cálculo Diferencial', area: 'EXACTAS' },
      
      // SOCIALES (10)
      { codigo: 'HIS101', nombre: 'Historia Argentina', area: 'SOCIALES' },
      { codigo: 'HIS102', nombre: 'Historia Universal', area: 'SOCIALES' },
      { codigo: 'GEO101', nombre: 'Geografía Mundial', area: 'SOCIALES' },
      { codigo: 'GEO102', nombre: 'Geografía Económica', area: 'SOCIALES' },
      { codigo: 'ECO101', nombre: 'Economía I', area: 'SOCIALES' },
      { codigo: 'ECO102', nombre: 'Economía II', area: 'SOCIALES' },
      { codigo: 'CIU101', nombre: 'Educación Ciudadana', area: 'SOCIALES' },
      { codigo: 'SOC101', nombre: 'Sociología', area: 'SOCIALES' },
      { codigo: 'PSI101', nombre: 'Psicología', area: 'SOCIALES' },
      { codigo: 'ANT101', nombre: 'Antropología', area: 'SOCIALES' },
      
      // NATURALES (10)
      { codigo: 'BIO101', nombre: 'Biología General', area: 'NATURALES' },
      { codigo: 'BIO102', nombre: 'Biología Celular', area: 'NATURALES' },
      { codigo: 'BIO103', nombre: 'Genética', area: 'NATURALES' },
      { codigo: 'BOT101', nombre: 'Botánica', area: 'NATURALES' },
      { codigo: 'ZOO101', nombre: 'Zoología', area: 'NATURALES' },
      { codigo: 'MIC101', nombre: 'Microbiología', area: 'NATURALES' },
      { codigo: 'ECO201', nombre: 'Ecología', area: 'NATURALES' },
      { codigo: 'GEO201', nombre: 'Geología', area: 'NATURALES' },
      { codigo: 'BIQ101', nombre: 'Bioquímica', area: 'NATURALES' },
      { codigo: 'BIO104', nombre: 'Biología Molecular', area: 'NATURALES' },
      
      // HUMANIDADES (10)
      { codigo: 'LIT101', nombre: 'Literatura Universal', area: 'HUMANIDADES' },
      { codigo: 'LIT102', nombre: 'Literatura Argentina', area: 'HUMANIDADES' },
      { codigo: 'FIL101', nombre: 'Filosofía I', area: 'HUMANIDADES' },
      { codigo: 'FIL102', nombre: 'Filosofía II', area: 'HUMANIDADES' },
      { codigo: 'ART101', nombre: 'Historia del Arte', area: 'HUMANIDADES' },
      { codigo: 'ART102', nombre: 'Arte Contemporáneo', area: 'HUMANIDADES' },
      { codigo: 'MUS101', nombre: 'Educación Musical', area: 'HUMANIDADES' },
      { codigo: 'MUS102', nombre: 'Teoría Musical', area: 'HUMANIDADES' },
      { codigo: 'TET101', nombre: 'Teatro', area: 'HUMANIDADES' },
      { codigo: 'FIL103', nombre: 'Ética', area: 'HUMANIDADES' }
    ];

    materiasConf.forEach((conf, idx) => {
      materias.push({
        id: idx + 1,
        codigo: conf.codigo,
        nombre: conf.nombre,
        area: conf.area,
        estado: 'ACTIVO'
      });
    });

    localStorage.setItem('profesort_materias', JSON.stringify(materias));
    console.log(`✅ ${materias.length} materias creadas (10 por área)`);

    // 5. CREAR ASIGNACIONES (DISTRIBUCIÓN DESIGUAL)
    console.log('\n📎 PASO 5: Creando asignaciones (distribución inequitativa)...');
    
    const asignaciones = [];
    let asignacionId = 1;

    // Roberto García (ID 2) - SOBRECARGADO: materias 1-10 (10 materias)
    for (let m = 1; m <= 10; m++) {
      asignaciones.push({
        id: asignacionId++,
        id_usuario: 2,
        id_materia: m,
        estado: 'ACTIVO',
        fecha_asignacion: '2025-01-15'
      });
    }

    // Laura Fernández (ID 3) - SOBRECARGADA: materias 11-19 (9 materias)
    for (let m = 11; m <= 19; m++) {
      asignaciones.push({
        id: asignacionId++,
        id_usuario: 3,
        id_materia: m,
        estado: 'ACTIVO',
        fecha_asignacion: '2025-01-15'
      });
    }

    // Daniel Rodríguez (ID 4) - SUBUTILIZADO: materia 20 (1 materia)
    asignaciones.push({
      id: asignacionId++,
      id_usuario: 4,
      id_materia: 20,
      estado: 'ACTIVO',
      fecha_asignacion: '2025-01-15'
    });

    // Patricia Gómez (ID 5) - SUBUTILIZADA: materia 21 (1 materia)
    asignaciones.push({
      id: asignacionId++,
      id_usuario: 5,
      id_materia: 21,
      estado: 'ACTIVO',
      fecha_asignacion: '2025-01-15'
    });

    // Carlos Martín (ID 6) - NORMAL: materias 22-24 (3 materias)
    for (let m = 22; m <= 24; m++) {
      asignaciones.push({
        id: asignacionId++,
        id_usuario: 6,
        id_materia: m,
        estado: 'ACTIVO',
        fecha_asignacion: '2025-01-15'
      });
    }

    // Ana María (ID 7) - NORMAL: materias 25-28 (4 materias)
    for (let m = 25; m <= 28; m++) {
      asignaciones.push({
        id: asignacionId++,
        id_usuario: 7,
        id_materia: m,
        estado: 'ACTIVO',
        fecha_asignacion: '2025-01-15'
      });
    }

    // Miguel Ángel (ID 8) - NORMAL: materias 29-31 (3 materias)
    for (let m = 29; m <= 31; m++) {
      asignaciones.push({
        id: asignacionId++,
        id_usuario: 8,
        id_materia: m,
        estado: 'ACTIVO',
        fecha_asignacion: '2025-01-15'
      });
    }

    // Isabel Ramírez (ID 9) - NORMAL: materias 32-35 (4 materias)
    for (let m = 32; m <= 35; m++) {
      asignaciones.push({
        id: asignacionId++,
        id_usuario: 9,
        id_materia: m,
        estado: 'ACTIVO',
        fecha_asignacion: '2025-01-15'
      });
    }

    // Materias 36-40 SIN ASIGNAR (5 materias) - Generan alerta

    localStorage.setItem('profesort_asignaciones', JSON.stringify(asignaciones));
    console.log(`✅ ${asignaciones.length} asignaciones creadas`);
    console.log('   📌 Roberto García: 10 materias (SOBRECARGADO)');
    console.log('   📌 Laura Fernández: 9 materias (SOBRECARGADA)');
    console.log('   📌 Daniel Rodríguez: 1 materia (SUBUTILIZADO)');
    console.log('   📌 Patricia Gómez: 1 materia (SUBUTILIZADA)');
    console.log('   📌 5 materias SIN ASIGNAR');

    // 6. CREAR ASISTENCIAS (ÚLTIMOS 90 DÍAS)
    console.log('\n📅 PASO 6: Generando registros de asistencia (últimos 90 días)...');
    
    const asistencias = [];
    let asistenciaId = 1;
    const hoy = new Date();
    
    // Estudiantes con diferentes porcentajes de asistencia
    const perfilesEstudiantes = [
      // CRÍTICOS: < 60%
      { ids: [10, 11, 12], porcentaje: 0.55, nombre: 'Crítico' },
      // REGULARES: 60-70%
      { ids: [13, 14], porcentaje: 0.65, nombre: 'Regular' },
      // BUENOS: 80-95%
      { ids: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], porcentaje: 0.88, nombre: 'Bueno' }
    ];

    // Generar 90 días de asistencias
    for (let d = 0; d < 90; d++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - d);
      const fechaStr = fecha.toISOString().split('T')[0];

      // Para cada perfil de estudiante
      perfilesEstudiantes.forEach(perfil => {
        // Para cada estudiante en el perfil
        perfil.ids.forEach(estudianteId => {
          // Para cada materia (distribuir entre 3 materias por estudiante)
          const materiaId = ((estudianteId - 10) % 10) + 1;
          const docenteId = [2, 3, 4, 5, 6, 7, 8, 9][Math.floor(Math.random() * 8)];

          // Determinar estado basado en porcentaje
          const rand = Math.random();
          let estado;
          if (rand < perfil.porcentaje) {
            estado = 'PRESENTE';
          } else if (rand < perfil.porcentaje + 0.05) {
            estado = 'TARDANZA';
          } else {
            estado = 'AUSENTE';
          }

          asistencias.push({
            id: asistenciaId++,
            id_usuario: estudianteId,
            id_materia: materiaId,
            id_docente: docenteId,
            fecha: fechaStr,
            estado: estado,
            observaciones: estado === 'AUSENTE' ? 'Sin justificación' : '',
            created_at: new Date().toISOString()
          });
        });
      });
    }

    localStorage.setItem('profesort_asistencias', JSON.stringify(asistencias));
    console.log(`✅ ${asistencias.length} registros de asistencia creados (90 días)`);
    console.log(`   📊 Estudiantes críticos: 3 con ~55% asistencia`);
    console.log(`   📊 Estudiantes regulares: 2 con ~65% asistencia`);
    console.log(`   📊 Estudiantes buenos: 15 con ~88% asistencia`);

    // 7. COMPLETAR
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ ¡RESET COMPLETADO EXITOSAMENTE!');
    console.log('\n📊 DATOS CARGADOS:');
    console.log(`   • 1 Administrador`);
    console.log(`   • 8 Docentes (2 sobrecargados, 2 subutilizados, 4 normales)`);
    console.log(`   • 20 Estudiantes (3 críticos, 2 regulares, 15 buenos)`);
    console.log(`   • 40 Materias (distribuidas inequitativamente)`);
    console.log(`   • ${asignaciones.length} Asignaciones (con 5 materias sin asignar)`);
    console.log(`   • ${asistencias.length} Registros de asistencia (90 días)`);
    
    console.log('\n⚡ ALERTAS ESPERADAS:');
    console.log('   ✓ 3 alertas CRÍTICAS de asistencia (< 60%)');
    console.log('   ✓ 2 alertas de asistencia REGULAR (60-70%)');
    console.log('   ✓ 2 alertas de docentes SOBRECARGADOS (9-10 materias)');
    console.log('   ✓ 2 alertas de docentes SUBUTILIZADOS (1 materia)');
    console.log('   ✓ 1 alerta de DESVIACIÓN ESTÁNDAR alta (σ > 2.0)');
    console.log('   ✓ 1 alerta de materias SIN ASIGNAR (5 materias)');
    
    console.log('\n🔄 La página se recargará en 2 segundos...');
    console.log('═'.repeat(60));

    // Recargar página
    setTimeout(() => {
      location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ ERROR al realizar el reset:', error);
    console.log('Por favor, intenta de nuevo o contacta al administrador');
  }
};

// Función alternativa para solo limpiar sin recargar
window.limpiarStorage = function() {
  if (confirm('¿Limpiar localStorage sin recargar?')) {
    localStorage.clear();
    console.log('✅ LocalStorage limpio. Puedes recargar la página manualmente con F5');
  }
};

// Mostrar funciones disponibles
console.log('%c🎯 FUNCIONES DISPONIBLES:', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
console.log('%cresetData()%c - Borra TODO y carga datos de demostración con todas las alertas', 'color: #FF9800; font-weight: bold;', 'color: #666;');
console.log('%climpiarStorage()%c - Solo limpia localStorage sin recargar', 'color: #2196F3; font-weight: bold;', 'color: #666;');
