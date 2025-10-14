/* 
 * Script de utilidad para debugging de LocalStorage
 * Ejecutar en la consola del navegador (F12)
 */

// Mostrar todos los datos de ProfeSort
function mostrarDatosProfeSort() {
  console.log('📊 === DATOS DE PROFESORT EN LOCALSTORAGE ===\n');
  
  const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
  const materias = JSON.parse(localStorage.getItem('profesort_materias') || '[]');
  const asignaciones = JSON.parse(localStorage.getItem('profesort_asignaciones') || '[]');
  
  // Usuarios por rol
  const admins = usuarios.filter(u => u.id_rol === 1);
  const docentes = usuarios.filter(u => u.id_rol === 2);
  const estudiantes = usuarios.filter(u => u.id_rol === 3);
  
  console.log(`👥 USUARIOS TOTALES: ${usuarios.length}`);
  console.log(`   🔑 Administradores: ${admins.length}`);
  console.log(`   👨‍🏫 Docentes: ${docentes.length}`);
  console.log(`   👨‍🎓 Estudiantes: ${estudiantes.length}\n`);
  
  console.log(`📚 MATERIAS: ${materias.length}\n`);
  console.log(`🔗 ASIGNACIONES: ${asignaciones.length}\n`);
  
  console.log('🔐 CREDENCIALES DE EJEMPLO:');
  console.log('   Admin: admin@profesort.com / Admin123');
  console.log('   Docente: karina.quinteros@profesort.com / Docente123');
  console.log('   Estudiante: estudiante01@mail.com / Estudiante123\n');
  
  return {
    usuarios: {
      total: usuarios.length,
      administradores: admins,
      docentes: docentes,
      estudiantes: estudiantes
    },
    materias: materias,
    asignaciones: asignaciones
  };
}

// Mostrar lista de docentes con sus materias
function mostrarDocentes() {
  const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
  const materias = JSON.parse(localStorage.getItem('profesort_materias') || '[]');
  const asignaciones = JSON.parse(localStorage.getItem('profesort_asignaciones') || '[]');
  
  const docentes = usuarios.filter(u => u.id_rol === 2);
  
  console.log('👨‍🏫 === LISTA DE DOCENTES ===\n');
  
  docentes.forEach((docente, index) => {
    const asignacionesDocente = asignaciones.filter(a => a.id_usuario === docente.id && a.estado === 'ACTIVO');
    const materiasDocente = asignacionesDocente.map(asig => {
      const materia = materias.find(m => m.id === asig.id_materia);
      return materia ? materia.nombre : 'Materia no encontrada';
    });
    
    console.log(`${index + 1}. ${docente.name}`);
    console.log(`   📧 Email: ${docente.email}`);
    console.log(`   🎓 Legajo: ${docente.legajo}`);
    console.log(`   🏢 Área: ${docente.area}`);
    console.log(`   📚 Materias (${materiasDocente.length}): ${materiasDocente.join(', ') || 'Sin asignar'}`);
    console.log('');
  });
}

// Mostrar lista de materias con docentes asignados
function mostrarMaterias() {
  const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
  const materias = JSON.parse(localStorage.getItem('profesort_materias') || '[]');
  const asignaciones = JSON.parse(localStorage.getItem('profesort_asignaciones') || '[]');
  
  console.log('📚 === LISTA DE MATERIAS ===\n');
  
  materias.forEach((materia, index) => {
    const asignacion = asignaciones.find(a => a.id_materia === materia.id && a.estado === 'ACTIVO');
    let docenteNombre = 'Sin asignar';
    
    if (asignacion) {
      const docente = usuarios.find(u => u.id === asignacion.id_usuario);
      if (docente) {
        docenteNombre = docente.name;
      }
    }
    
    console.log(`${index + 1}. ${materia.nombre} (${materia.codigo})`);
    console.log(`   👨‍🏫 Docente: ${docenteNombre}`);
    console.log(`   ⏰ Horas semanales: ${materia.horas_semanales || 'No especificado'}`);
    console.log(`   🏢 Área: ${materia.area || 'No especificado'}`);
    console.log('');
  });
}

// Mostrar lista de estudiantes
function mostrarEstudiantes() {
  const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
  const estudiantes = usuarios.filter(u => u.id_rol === 3);
  
  console.log('👨‍🎓 === LISTA DE ESTUDIANTES ===\n');
  
  estudiantes.forEach((estudiante, index) => {
    console.log(`${index + 1}. ${estudiante.name}`);
    console.log(`   📧 Email: ${estudiante.email}`);
    console.log(`   🎓 Legajo: ${estudiante.legajo}`);
    console.log(`   🆔 DNI: ${estudiante.dni}`);
    console.log(`   ✅ Estado: ${estudiante.is_active ? 'Activo' : 'Inactivo'}`);
    console.log('');
  });
}

// Resetear todos los datos
function resetearDatos() {
  if (confirm('⚠️ ¿Estás seguro de que quieres resetear todos los datos? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('profesort_usuarios');
    localStorage.removeItem('profesort_materias');
    localStorage.removeItem('profesort_asignaciones');
    localStorage.removeItem('profesort_initialized');
    console.log('✅ Datos reseteados. Recarga la página para cargar datos iniciales.');
    return true;
  }
  return false;
}

// Exportar datos en formato JSON
function exportarDatos() {
  const datos = {
    usuarios: JSON.parse(localStorage.getItem('profesort_usuarios') || '[]'),
    materias: JSON.parse(localStorage.getItem('profesort_materias') || '[]'),
    asignaciones: JSON.parse(localStorage.getItem('profesort_asignaciones') || '[]')
  };
  
  const json = JSON.stringify(datos, null, 2);
  console.log('📤 Datos exportados:');
  console.log(json);
  
  // Copiar al portapapeles si está disponible
  if (navigator.clipboard) {
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Datos copiados al portapapeles');
    });
  }
  
  return datos;
}

// Buscar usuario por email
function buscarUsuario(email) {
  const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
  const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (usuario) {
    console.log('👤 Usuario encontrado:');
    console.log(usuario);
    console.log('\n🔑 Pregunta secreta:', usuario.pregunta_secreta);
    console.log('📝 Respuesta secreta:', usuario.respuesta_secreta);
  } else {
    console.log('❌ Usuario no encontrado');
  }
  
  return usuario;
}

// Cambiar contraseña de un usuario
function cambiarContrasena(email, nuevaContrasena) {
  const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
  const index = usuarios.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (index !== -1) {
    usuarios[index].password = nuevaContrasena;
    localStorage.setItem('profesort_usuarios', JSON.stringify(usuarios));
    console.log(`✅ Contraseña cambiada para ${email}`);
    console.log(`   Nueva contraseña: ${nuevaContrasena}`);
    return true;
  } else {
    console.log('❌ Usuario no encontrado');
    return false;
  }
}

// Mostrar ayuda
function ayuda() {
  console.log('🛠️ === COMANDOS DISPONIBLES ===\n');
  console.log('mostrarDatosProfeSort()    - Muestra resumen de todos los datos');
  console.log('mostrarDocentes()          - Lista todos los docentes con sus materias');
  console.log('mostrarMaterias()          - Lista todas las materias con docentes');
  console.log('mostrarEstudiantes()       - Lista todos los estudiantes');
  console.log('buscarUsuario(email)       - Busca un usuario por email');
  console.log('cambiarContrasena(email, nueva) - Cambia la contraseña de un usuario');
  console.log('exportarDatos()            - Exporta todos los datos en JSON');
  console.log('resetearDatos()            - Resetea todos los datos (requiere confirmación)');
  console.log('ayuda()                    - Muestra esta ayuda\n');
}

// Mostrar ayuda al cargar
console.log('🎓 === PROFESORT DEBUG TOOLS ===');
console.log('Escribe ayuda() para ver los comandos disponibles\n');

// =========================
// CARGAR DATOS DE DEMO PARA ESTADÍSTICAS
// Ejecutar en consola o incluir temporalmente en el index.html para poblar localStorage
window.cargarDatosDemoEstadisticas = function() {
  // Materias demo
  const materias = [
    { id: 1, nombre: 'Matemática I', area: 'Exactas' },
    { id: 2, nombre: 'Lengua', area: 'Lengua' },
    { id: 3, nombre: 'Historia', area: 'Sociales' },
    { id: 4, nombre: 'Biología', area: 'Naturales' },
    { id: 5, nombre: 'Física', area: 'Exactas' },
    { id: 6, nombre: 'Literatura', area: 'Lengua' },
    { id: 7, nombre: 'Geografía', area: 'Sociales' },
    { id: 8, nombre: 'Química', area: 'Exactas' }
  ];
  localStorage.setItem('profesort_materias', JSON.stringify(materias));

  // Estudiantes demo
  const estudiantes = [
    { id: 1, nombre: 'Ana López', legajo: 'A001' },
    { id: 2, nombre: 'Juan Pérez', legajo: 'A002' },
    { id: 3, nombre: 'María Gómez', legajo: 'A003' },
    { id: 4, nombre: 'Carlos Díaz', legajo: 'A004' },
    { id: 5, nombre: 'Lucía Torres', legajo: 'A005' },
    { id: 6, nombre: 'Pedro Ruiz', legajo: 'A006' },
    { id: 7, nombre: 'Sofía Romero', legajo: 'A007' },
    { id: 8, nombre: 'Martín Castro', legajo: 'A008' }
  ];
  localStorage.setItem('profesort_estudiantes', JSON.stringify(estudiantes));

  // Asignaciones (cada estudiante tiene 2 materias)
  const asignaciones = [
    { estudianteId: 1, materiaId: 1 },
    { estudianteId: 1, materiaId: 2 },
    { estudianteId: 2, materiaId: 3 },
    { estudianteId: 2, materiaId: 4 },
    { estudianteId: 3, materiaId: 5 },
    { estudianteId: 3, materiaId: 6 },
    { estudianteId: 4, materiaId: 7 },
    { estudianteId: 4, materiaId: 8 },
    { estudianteId: 5, materiaId: 1 },
    { estudianteId: 5, materiaId: 3 },
    { estudianteId: 6, materiaId: 2 },
    { estudianteId: 6, materiaId: 4 },
    { estudianteId: 7, materiaId: 5 },
    { estudianteId: 7, materiaId: 7 },
    { estudianteId: 8, materiaId: 6 },
    { estudianteId: 8, materiaId: 8 }
  ];
  localStorage.setItem('profesort_asignaciones', JSON.stringify(asignaciones));

  // Asistencias (varias fechas, estados variados)
  const estados = ['PRESENTE', 'AUSENTE', 'TARDANZA'];
  const asistencias = [];
  let id = 1;
  for (let d = 1; d <= 10; d++) {
    const fecha = `2025-10-${d.toString().padStart(2, '0')}`;
    asignaciones.forEach(asig => {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      asistencias.push({
        id: id++,
        id_estudiante: asig.estudianteId,
        id_materia: asig.materiaId,
        id_docente: 1,
        fecha,
        estado,
        observaciones: '',
        created_at: fecha + 'T08:00:00Z'
      });
    });
  }
  localStorage.setItem('profesort_asistencias', JSON.stringify(asistencias));

  alert('Datos de ejemplo para estadísticas cargados en localStorage. Recarga la página para ver los gráficos completos.');
};
// Ejecuta en consola: cargarDatosDemoEstadisticas();
