# 🔄 Script de Reset Completo - ProfeSort

## ¿Qué hace este script?

Borra **COMPLETAMENTE** todos los datos del localStorage y carga un conjunto completo de datos de demostración que incluye:

### 📊 DATOS QUE SE CARGAN:
- ✅ **1 Administrador**
- ✅ **8 Docentes** (2 sobrecargados, 2 subutilizados, 4 con carga normal)
- ✅ **20 Estudiantes** (3 con asistencia crítica, 2 regular, 15 buena)
- ✅ **40 Materias** (10 por cada área: EXACTAS, SOCIALES, NATURALES, HUMANIDADES)
- ✅ **35 Asignaciones** de materias a docentes (distribución inequitativa)
- ✅ **1000+ Registros de asistencia** (últimos 90 días)

---

## ⚡ ALERTAS ESPERADAS

El script genera automáticamente datos que disparan todas las alertas del sistema:

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| 🔴 CRÍTICAS | 3 | Estudiantes con asistencia < 60% |
| 🟠 REGULARES | 2 | Estudiantes con asistencia 60-70% |
| 📊 DISTRIBUCIÓN | 2 | Docentes sobrecargados (9-10 materias) |
| 📊 DISTRIBUCIÓN | 2 | Docentes subutilizados (1 materia) |
| 📊 DESVIACIÓN | 1 | Desviación estándar alta (σ > 2.0) |
| 🟡 SIN ASIGNAR | 1 | 5 materias sin docente asignado |

---

## 🚀 CÓMO USAR

### Opción 1: Desde la Consola del Navegador (RECOMENDADO)

1. **Abre la aplicación** en tu navegador
2. **Presiona F12** para abrir las Herramientas de Desarrollador
3. **Ve a la pestaña "Console"** (Consola)
4. **Escribe el comando:**
   ```javascript
   resetData()
   ```
5. **Presiona Enter**
6. **Confirma** en el cuadro de diálogo
7. ✅ **Listo**: La página se recargará automáticamente con los nuevos datos

### Opción 2: Limpiar solo localStorage (sin recargar)

En la consola, ejecuta:
```javascript
limpiarStorage()
```

---

## 📋 ESTRUCTURA DE DATOS

### Usuarios
```json
{
  "id": 1,
  "name": "Administrador Sistema",
  "email": "admin@profesort.edu",
  "id_rol": 1,
  "legajo": "ADMIN001",
  "dni": "12345678",
  "estado": "ACTIVO"
}
```

### Materias
```json
{
  "id": 1,
  "codigo": "MAT101",
  "nombre": "Matemática I",
  "area": "EXACTAS",
  "estado": "ACTIVO"
}
```

### Asignaciones
```json
{
  "id": 1,
  "id_usuario": 2,
  "id_materia": 1,
  "estado": "ACTIVO",
  "fecha_asignacion": "2025-01-15"
}
```

### Asistencias
```json
{
  "id": 1,
  "id_usuario": 10,
  "id_materia": 1,
  "id_docente": 2,
  "fecha": "2025-10-24",
  "estado": "PRESENTE",
  "observaciones": "",
  "created_at": "2025-10-24T12:00:00Z"
}
```

---

## 🎓 PERFILES DE ESTUDIANTES

### Críticos (IDs: 10, 11, 12)
- **Asistencia**: ~55%
- **Genera**: 3 alertas críticas

### Regulares (IDs: 13, 14)
- **Asistencia**: ~65%
- **Genera**: 2 alertas de advertencia

### Buenos (IDs: 15-29)
- **Asistencia**: ~88%
- **Genera**: Datos de referencia

---

## 👨‍🏫 PERFILES DE DOCENTES

### Sobrecargados
- **Roberto García**: 10 materias ⚠️
- **Laura Fernández**: 9 materias ⚠️

### Subutilizados
- **Daniel Rodríguez**: 1 materia ⚠️
- **Patricia Gómez**: 1 materia ⚠️

### Normales (3-4 materias cada uno)
- Carlos Martín: 3 materias
- Ana María Torres: 4 materias
- Miguel Ángel Silva: 3 materias
- Isabel Ramírez: 4 materias

---

## 🛠️ LOCALSTORAGE KEYS

El script utiliza estas claves para almacenar datos:

| Clave | Contenido |
|-------|-----------|
| `profesort_usuarios` | Array de usuarios |
| `profesort_materias` | Array de materias |
| `profesort_asignaciones` | Array de asignaciones |
| `profesort_asistencias` | Array de asistencias |

---

## ⚠️ ADVERTENCIAS

- ❌ **Este script BORRA todos los datos existentes**
- ❌ **No se puede deshacer** (los datos locales se pierden)
- ✅ **Se solicita confirmación** antes de ejecutar
- ✅ **La página se recarga automáticamente** después

---

## 🐛 TROUBLESHOOTING

### "La función resetData() no aparece en la consola"
- ✅ Recarga la página (F5)
- ✅ Verifica que el script se cargó correctamente
- ✅ Abre la consola nuevamente

### "No veo las alertas después del reset"
- ✅ Navega a la sección de Alertas
- ✅ Espera a que se carguen los datos (2-3 segundos)
- ✅ Recarga la página si es necesario

### "Los gráficos están rotos"
- ✅ Los datos de asistencia están completos
- ✅ Verifica que las gráficas se estén cargando
- ✅ Abre la consola (F12) para ver errores

---

## 📱 INFORMACIÓN ÚTIL

- 📍 El script mantiene toda la estructura de datos que tu aplicación espera
- 📍 Puedes ejecutarlo múltiples veces sin problema
- 📍 Los datos se generan con fechas realistas (últimos 90 días)
- 📍 Incluye todas las tablas necesarias para funcionar correctamente

---

## 🎯 PRÓXIMOS PASOS

1. Ejecuta `resetData()`
2. Navega a las diferentes secciones:
   - **Alertas**: Verás 11 alertas del sistema
   - **Estadísticas**: Gráficos con datos completos
   - **Asistencia**: Registros de los últimos 90 días
   - **Docentes**: Con carga de trabajo inequitativa
   - **Estudiantes**: Con diferentes niveles de asistencia

---

**¡Listo para demostrar todas las funcionalidades del sistema!** 🚀
