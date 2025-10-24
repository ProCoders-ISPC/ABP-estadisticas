// Herramientas de depuracion - debug-tools.js

function cargarDatosDemo() {
    console.log('=== CARGANDO DATOS DE DEMOSTRACION ===');
    
    // Importar servicio manualmente mediante inyección en Angular
    const angular = window.ng;
    if (!angular) {
        console.error('Angular no está disponible. Asegúrate de estar en la aplicación Angular.');
        console.log('Alternativa: Usa el método manual desde la consola del navegador');
        return;
    }
    
    console.log('✅ Usa DatosDemoService.cargarDatosDemo() desde Angular DevTools');
    console.log('O ejecuta: ng.getComponent(document.querySelector("app-root")).injector.get(DatosDemoService).cargarDatosDemo()');
}

function verAlertas() {
    const alertas = JSON.parse(localStorage.getItem('profesort_alertas') || '[]');
    console.log('Total alertas:', alertas.length);
    console.table(alertas);
    return alertas;
}

function verEstadisticas() {
    const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios') || '[]');
    const materias = JSON.parse(localStorage.getItem('profesort_materias') || '[]');
    const docentes = usuarios.filter(u => u.rol === 'docente');
    const estudiantes = usuarios.filter(u => u.rol === 'estudiante');
    
    console.log('Docentes:', docentes.length);
    console.log('Estudiantes:', estudiantes.length);
    console.log('Materias:', materias.length);
    return { docentes: docentes.length, estudiantes: estudiantes.length, materias: materias.length };
}

function resetearSistema() {
    if (confirm('Eliminar todos los datos?')) {
        localStorage.clear();
        console.log('Sistema reseteado. Recarga la pagina (F5)');
        location.reload();
    }
}

console.log('Debug tools cargadas: cargarDatosDemo(), verAlertas(), verEstadisticas(), resetearSistema()');
