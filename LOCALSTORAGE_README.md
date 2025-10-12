# Sistema ProfeSort - Maqueta Funcional con LocalStorage

## 📋 Descripción

Este proyecto ha sido configurado para funcionar completamente con LocalStorage del navegador, permitiendo pruebas y desarrollo sin necesidad de un backend activo.

## 🎯 Características Implementadas

### 1. **Sistema de Autenticación Completo**
- ✅ Login con email y contraseña
- ✅ Registro de nuevos usuarios con validaciones
- ✅ Ver/Ocultar contraseña en ambos formularios
- ✅ Recuperación de contraseña con pregunta secreta
- ✅ Preguntas de seguridad predefinidas

### 2. **Datos Precargados**
- **1 Administrador**: admin@profesort.com / Admin123
- **20 Docentes**: correos tipo `nombre.apellido@profesort.com` / Docente123
- **30 Estudiantes**: correos tipo `estudiante01@mail.com` / Estudiante123
- **10 Materias**: Con códigos, áreas de conocimiento y docentes asignados
- **Asignaciones**: Docentes asignados a materias
- **Asistencias**: Datos de asistencia de las últimas 4 semanas (automatizadas)

### 3. **Paneles Administrativos**
#### Panel de Docentes
- Visualizar lista de docentes con estadísticas
- Editar información de docentes
- Ver materias asignadas
- Filtros por estado y área
- Promover docentes a administradores
- Convertir usuarios regulares en docentes

#### Panel de Materias
- **Sistema de Pestañas**: Materias y Áreas de Conocimiento
- **Gestión de Materias**:
  - Crear, editar y eliminar materias
  - Selector de Área de Conocimiento
  - Asignar/desasignar docentes a materias
  - Búsqueda de docentes por nombre, legajo o DNI
  - Visualización con badges de área y docente
- **Gestión de Áreas** (Nueva Funcionalidad):
  - Crear áreas personalizadas con código único
  - Editar nombre, descripción y color de áreas
  - Eliminar áreas (con validación de materias asignadas)
  - Selector de color personalizado para cada área
  - Vista de materias agrupadas por área
  - Asignación visual de materias a áreas
  - 9 Áreas predefinidas: Exactas, Sociales, Naturales, Humanidades, Tecnología, Artes, Lengua, Educación Física, Salud

#### Panel de Estudiantes
- **Completamente funcional** (eliminado mensaje "en construcción")
- Listar todos los estudiantes con paginación
- Crear nuevos estudiantes con formulario completo
- Editar información de estudiantes
- Eliminar estudiantes con confirmación
- Filtros y búsqueda en tiempo real
- Estados visuales (Activo/Inactivo)
- Modal de edición responsive

### 4. **Recuperación de Contraseña**
Flujo completo en 3 pasos:
1. Ingresar email
2. Responder pregunta secreta
3. Establecer nueva contraseña

### 5. **Panel de Informes Estadísticos**
- Distribución de docentes por área
- Carga académica por docente (Top 15)
- Distribución de materias (asignadas vs sin asignar)
- **Estadísticas de estudiantes y asistencia**:
  - Total de estudiantes activos/inactivos
  - Promedio general de asistencia
  - **Gráfico de torta**: Distribución de materias por área
  - **Gráfico de barras**: Evolución de asistencia semanal
  - Ranking de estudiantes por asistencia (Top 20)
  - Detalle de asistencia por semana

### 6. **Sistema de Asistencia**
- Panel para docentes: Toma de asistencia por materia y fecha
- Estados: Presente, Ausente, Tardanza
- Registro por lotes (toda la clase a la vez)
- Resumen en tiempo real (presentes, ausentes, porcentaje)
- Historial de asistencia por estudiante
- Cálculo automático de porcentajes (tardanza = 50% asistencia)

## 🔑 Credenciales de Acceso

### Administrador
- **Email**: admin@profesort.com
- **Contraseña**: Admin123
- **Pregunta Secreta**: ¿Cuál es tu color favorito?
- **Respuesta**: azul

### Docentes (Ejemplos)
- **Email**: karina.quinteros@profesort.com
- **Contraseña**: Docente123
- **Email**: juan.sanchez@profesort.com
- **Contraseña**: Docente123

### Estudiantes (Ejemplos)
- **Email**: estudiante01@mail.com
- **Contraseña**: Estudiante123
- **Email**: estudiante02@mail.com
- **Contraseña**: Estudiante123

## 🚀 Cómo Usar

### Activar/Desactivar LocalStorage
En el archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  useLocalStorage: true  // true = LocalStorage, false = API real
};
```

### Iniciar la Aplicación
```bash
npm install
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Resetear Datos
Para resetear todos los datos a su estado inicial, ejecuta en la consola del navegador:
```javascript
localStorage.removeItem('profesort_usuarios');
localStorage.removeItem('profesort_materias');
localStorage.removeItem('profesort_asignaciones');
localStorage.removeItem('profesort_initialized');
```
Luego recarga la página.

## 📦 Estructura de Datos

### Usuarios (LocalStorage)
```typescript
{
  id: number;
  email: string;
  password: string;
  name: string;
  id_rol: number; // 1=Admin, 2=Docente, 3=Estudiante
  legajo: string;
  dni: string;
  fecha_nacimiento: string;
  domicilio: string;
  telefono: string;
  fecha_ingreso: string;
  area: string;
  is_active: boolean;
  pregunta_secreta?: string;
  respuesta_secreta?: string;
}
```

### Materias (LocalStorage)
```typescript
{
  id: number;
  nombre: string;
  codigo: string;
  horas_semanales?: number;
  area?: string;
  nivel?: string;
  docenteId?: number;
  docenteNombre?: string;
  docenteLegajo?: string;
}
```

### Asignaciones (LocalStorage)
```typescript
{
  id: number;
  id_rol: number;
  id_materia: number;
  id_usuario: number;
  fecha_asignacion: string;
  estado: string; // 'ACTIVO' | 'INACTIVO'
}
```

## 🛠️ Servicios Implementados

### Servicios Principales
- `LocalStorageService`: Gestión de datos en LocalStorage
- `AuthService`: Autenticación con soporte LocalStorage
- `MateriasService`: CRUD de materias (LocalStorage + API)
- `AdminDocenteService`: Gestión de docentes (LocalStorage + API)
- `EstudiantesService`: Gestión de estudiantes (LocalStorage + API)

### Servicios Auxiliares (LocalStorage)
- `MateriasLocalService`
- `AdminDocenteLocalService`
- `EstudiantesLocalService`

## 🎨 Características de UI

### Login
- Campo de contraseña con botón para mostrar/ocultar
- Enlace "¿Olvidaste tu contraseña?" funcional
- Modal de recuperación en 3 pasos
- Validaciones en tiempo real
- Mensajes de error personalizados

### Registro
- Campos de contraseña con botón para mostrar/ocultar
- Selector de pregunta secreta
- Campo de respuesta secreta
- Validaciones completas
- Indicador de requisitos de contraseña

### Paneles Administrativos
- Diseño consistente
- Filtros y búsquedas funcionales
- Modales para edición
- Confirmaciones para eliminaciones
- Mensajes de éxito y error

## 📝 Notas Importantes

1. **Datos Persistentes**: Los datos se guardan en LocalStorage del navegador y persisten entre sesiones.

2. **Desarrollo**: El modo LocalStorage es ideal para desarrollo sin backend.

3. **Producción**: Cambiar `useLocalStorage: false` en environment.ts para usar API real.

4. **Contraseñas**: En LocalStorage se guardan en texto plano (solo para desarrollo/demo).

5. **Navegadores**: Los datos son específicos por navegador y dominio.

## 🔄 Migración a API Real

Cuando el backend esté listo:

1. Cambiar `useLocalStorage: false` en `environment.ts`
2. Los servicios automáticamente usarán las llamadas HTTP reales
3. Verificar que los endpoints en el backend coincidan con los configurados

## 🐛 Debugging

Para inspeccionar los datos en LocalStorage:

### Chrome DevTools
1. F12 → Application → Local Storage → http://localhost:4200
2. Ver las claves: `profesort_usuarios`, `profesort_materias`, `profesort_asignaciones`

### Exportar Datos
En la consola del navegador:
```javascript
// Obtener el servicio
const localStorageService = window.ng.getComponent(document.querySelector('app-root')).injector.get(LocalStorageService);

// Exportar todos los datos
console.log(localStorageService.exportData());
```

## ✅ Checklist de Funcionalidades

- [x] Sistema de login con validación
- [x] Sistema de registro con validaciones
- [x] Ver/ocultar contraseña
- [x] Recuperación de contraseña con pregunta secreta
- [x] 20 Docentes precargados
- [x] 30 Estudiantes precargados
- [x] 10 Materias precargadas
- [x] Panel de gestión de docentes
- [x] Panel de gestión de materias
- [x] Panel de gestión de estudiantes
- [x] Asignación de docentes a materias
- [x] Edición de información de docentes
- [x] Creación y edición de materias
- [x] Creación y edición de estudiantes
- [x] Filtros y búsquedas funcionales
- [x] Promover usuarios a diferentes roles
- [x] Activar/desactivar usuarios
- [x] Mensajes de confirmación y error
- [x] Persistencia de datos en LocalStorage
- [x] Sistema de pestañas en gestión de materias
- [x] CRUD completo de áreas de conocimiento
- [x] Asignación de materias a áreas
- [x] Selector de colores para áreas
- [x] Vista agrupada de materias por área

## 📞 Soporte

Para cualquier duda o problema, revisar:
1. Consola del navegador (F12)
2. Estado de LocalStorage
3. Configuración en environment.ts
4. Logs en la consola al realizar operaciones

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Estado**: Completamente funcional con LocalStorage
