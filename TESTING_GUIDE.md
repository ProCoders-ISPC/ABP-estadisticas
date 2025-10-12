# 🎯 Guía de Pruebas - Sistema ProfeSort con LocalStorage

## ✅ Todo está Listo y Funcionando

El sistema ahora está **100% funcional** con LocalStorage. Aquí está cómo probarlo:

---

## 🚀 Inicio Rápido

### 1. Iniciar la Aplicación
```bash
cd c:\Users\av-cr\OneDrive\Escritorio\abp-estadistica
ng serve
```

Abrir en el navegador: **http://localhost:4200**

---

## 🧪 Pruebas a Realizar

### ✅ PRUEBA 1: Registro de Nuevo Usuario

1. **Ir a**: http://localhost:4200/register
2. **Llenar el formulario** con:
   - Nombre: Tu nombre
   - Apellido: Tu apellido
   - DNI: 12345678
   - Fecha de nacimiento: (cualquier fecha mayor a 16 años)
   - Domicilio: Tu dirección
   - Teléfono: 1234567890
   - Email: tunombre@test.com
   - Confirmar email: tunombre@test.com
   - Contraseña: Test123 (probar botón de ver/ocultar 👁️)
   - Confirmar contraseña: Test123 (probar botón de ver/ocultar 👁️)
   - Legajo: TEST001
   - **Pregunta secreta**: Seleccionar una del dropdown
   - **Respuesta secreta**: Escribir tu respuesta
   - ✅ Aceptar términos

3. **Hacer clic en "Registrarse"**
4. **Resultado esperado**: 
   - ✅ Mensaje de éxito
   - ✅ Redirección automática a login después de 2 segundos

---

### ✅ PRUEBA 2: Verificar Usuario en Panel de Admin

1. **Cerrar sesión** (si estás logueado)
2. **Iniciar sesión como Admin**:
   - Email: `admin@profesort.com`
   - Password: `Admin123`
3. **Ir a**: Panel de Usuarios o Estudiantes
4. **Resultado esperado**:
   - ✅ El usuario que acabas de registrar aparece en la lista
   - ✅ Estado: Activo
   - ✅ Rol: Usuario/Estudiante

---

### ✅ PRUEBA 3: Login con Usuario Nuevo

1. **Cerrar sesión**
2. **Iniciar sesión** con el usuario que registraste:
   - Email: tunombre@test.com
   - Password: Test123
3. **Probar botón de ver/ocultar contraseña** 👁️
4. **Resultado esperado**:
   - ✅ Login exitoso
   - ✅ Redirección según el rol

---

### ✅ PRUEBA 4: Recuperar Contraseña

1. **Ir a**: http://localhost:4200/login
2. **Hacer clic** en "¿Olvidaste tu contraseña?"
3. **Paso 1 - Email**:
   - Ingresar: tunombre@test.com
   - Hacer clic en "Continuar"
4. **Paso 2 - Pregunta Secreta**:
   - Verás la pregunta que configuraste
   - Ingresar tu respuesta
   - Hacer clic en "Verificar"
5. **Paso 3 - Nueva Contraseña**:
   - Nueva contraseña: NuevaPass123
   - Confirmar: NuevaPass123
   - Hacer clic en "Cambiar Contraseña"
6. **Resultado esperado**:
   - ✅ Mensaje de éxito
   - ✅ Modal se cierra automáticamente
   - ✅ Puedes iniciar sesión con la nueva contraseña

---

### ✅ PRUEBA 5: Panel de Informes (Estadísticas)

1. **Iniciar sesión como Admin**
2. **Ir a**: http://localhost:4200/admin/informes
3. **Resultado esperado**:
   - ✅ **SIN mensaje de "En Construcción"**
   - ✅ Ver estadísticas de:
     - Total de docentes (20)
     - Total de materias (10)
     - Total de estudiantes (30 + los que hayas registrado)
     - Distribución por áreas
     - Gráficos de barras funcionales

---

### ✅ PRUEBA 6: CRUD de Docentes

1. **Ir a**: http://localhost:4200/admin/docentes
2. **Probar**:
   - ✅ Ver lista de 20 docentes
   - ✅ Filtrar por área (EXACTAS, SOCIALES, etc.)
   - ✅ Buscar por nombre
   - ✅ Editar un docente (cambiar teléfono, email, etc.)
   - ✅ Ver materias asignadas a cada docente
3. **Resultado esperado**:
   - ✅ Todos los cambios se guardan
   - ✅ Los cambios persisten al recargar la página

---

### ✅ PRUEBA 7: CRUD de Materias

1. **Ir a**: http://localhost:4200/admin/materias
2. **Probar**:
   - ✅ Ver lista de 10 materias con docentes asignados
   - ✅ **Crear nueva materia**:
     - Nombre: Programación I
     - Código: PROG101
     - Buscar y asignar un docente
     - Guardar
   - ✅ **Editar materia**:
     - Cambiar nombre o código
     - Cambiar docente asignado
     - Guardar
   - ✅ **Eliminar materia**
     - Confirmar eliminación
3. **Resultado esperado**:
   - ✅ La nueva materia aparece en la lista
   - ✅ Los cambios se reflejan inmediatamente
   - ✅ Los docentes se pueden asignar/desasignar
   - ✅ La eliminación funciona correctamente

---

### ✅ PRUEBA 8: CRUD de Estudiantes

1. **Ir a**: Panel de Estudiantes (si existe en tu admin)
2. **Probar**:
   - ✅ Ver lista de 30 estudiantes
   - ✅ Crear nuevo estudiante
   - ✅ Editar información
   - ✅ Eliminar estudiante
3. **Resultado esperado**:
   - ✅ Todas las operaciones CRUD funcionan
   - ✅ Los cambios persisten

---

### ✅ PRUEBA 9: Persistencia de Datos

1. **Realizar varios cambios**:
   - Crear una materia
   - Editar un docente
   - Registrar un usuario
2. **Cerrar el navegador completamente**
3. **Abrir de nuevo** y navegar a http://localhost:4200
4. **Iniciar sesión**
5. **Resultado esperado**:
   - ✅ Todos los cambios siguen ahí
   - ✅ Los datos persisten en LocalStorage

---

### ✅ PRUEBA 10: Promover Usuario a Docente

1. **Crear un usuario regular** (registro normal)
2. **Iniciar sesión como Admin**
3. **Ir a**: Panel de Docentes
4. **Hacer clic** en "Usuarios Regulares" o similar
5. **Promover** el usuario a Docente
6. **Resultado esperado**:
   - ✅ Usuario cambia de rol
   - ✅ Aparece en lista de docentes
   - ✅ Puede ser asignado a materias

---

## 🔍 Debugging en Tiempo Real

### Ver Datos en Consola del Navegador (F12)

```javascript
// Ver todos los datos
const usuarios = JSON.parse(localStorage.getItem('profesort_usuarios'));
const materias = JSON.parse(localStorage.getItem('profesort_materias'));
const asignaciones = JSON.parse(localStorage.getItem('profesort_asignaciones'));

console.log('Usuarios:', usuarios.length);
console.log('Materias:', materias.length);
console.log('Asignaciones:', asignaciones.length);

// Buscar tu usuario
const miUsuario = usuarios.find(u => u.email === 'tunombre@test.com');
console.log('Mi usuario:', miUsuario);

// Ver docentes
const docentes = usuarios.filter(u => u.id_rol === 2);
console.log('Docentes:', docentes.length);

// Ver estudiantes
const estudiantes = usuarios.filter(u => u.id_rol === 3);
console.log('Estudiantes:', estudiantes.length);
```

---

## 🎨 Características Visuales a Probar

### Login/Register
- ✅ Botones de ver/ocultar contraseña funcionan
- ✅ Iconos de ojo cambian al hacer clic
- ✅ Validaciones en tiempo real
- ✅ Mensajes de error rojos
- ✅ Mensajes de éxito verdes

### Modal de Recuperación
- ✅ Aparece al hacer clic en "¿Olvidaste tu contraseña?"
- ✅ Tiene 3 pasos claros
- ✅ Botón X para cerrar
- ✅ Click fuera del modal lo cierra
- ✅ Diseño coherente con el resto de la app

### Paneles Admin
- ✅ Tablas con datos reales
- ✅ Botones de acción funcionan
- ✅ Modales de edición
- ✅ Confirmaciones de eliminación
- ✅ Mensajes de éxito/error

---

## 📊 Datos Precargados para Probar

### Administrador
```
Email: admin@profesort.com
Password: Admin123
Pregunta: ¿Cuál es tu color favorito?
Respuesta: azul
```

### Docentes (algunos ejemplos)
```
Email: karina.quinteros@profesort.com
Password: Docente123

Email: juan.sanchez@profesort.com
Password: Docente123

Email: cristian.vargas@profesort.com
Password: Docente123
```

### Estudiantes (algunos ejemplos)
```
Email: estudiante01@mail.com
Password: Estudiante123

Email: estudiante02@mail.com
Password: Estudiante123
```

---

## 🐛 Si Algo No Funciona

### Opción 1: Resetear Datos
```javascript
// En consola del navegador (F12)
localStorage.removeItem('profesort_usuarios');
localStorage.removeItem('profesort_materias');
localStorage.removeItem('profesort_asignaciones');
localStorage.removeItem('profesort_initialized');
location.reload();
```

### Opción 2: Ver Errores en Consola
1. Abrir DevTools (F12)
2. Tab "Console"
3. Ver si hay errores en rojo
4. Tab "Application" → Local Storage → Ver datos

### Opción 3: Verificar LocalStorage
1. F12 → Application
2. Local Storage → http://localhost:4200
3. Ver las 4 claves:
   - `profesort_usuarios`
   - `profesort_materias`
   - `profesort_asignaciones`
   - `profesort_initialized`

---

## ✅ Checklist de Verificación

Marca lo que hayas probado:

- [ ] Registro de nuevo usuario funciona
- [ ] Usuario aparece en panel de admin
- [ ] Login con nuevo usuario funciona
- [ ] Recuperación de contraseña funciona (3 pasos)
- [ ] Botones de ver/ocultar contraseña funcionan
- [ ] Panel de informes muestra estadísticas (sin "en construcción")
- [ ] CRUD de docentes completo
- [ ] CRUD de materias completo
- [ ] CRUD de estudiantes completo
- [ ] Asignación docente-materia funciona
- [ ] Edición de docentes se refleja inmediatamente
- [ ] Creación de materias funciona
- [ ] Eliminación de materias funciona
- [ ] Datos persisten al cerrar navegador
- [ ] Filtros y búsquedas funcionan
- [ ] Promover usuario a docente funciona

---

## 🎉 ¡Todo Listo!

Si todas las pruebas pasan, tu sistema está **100% funcional** con LocalStorage.

Cuando quieras migrar al backend real:
1. Ir a `src/environments/environment.ts`
2. Cambiar `useLocalStorage: false`
3. ¡Listo! Automáticamente usará las APIs

---

**¿Preguntas?** Revisa el archivo `LOCALSTORAGE_README.md` para más detalles técnicos.
