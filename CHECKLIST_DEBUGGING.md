# ✅ Checklist de Debugging - Dashboards de Informes

## Estado de los Gráficos

### 1. 📊 Distribución de Docentes por Área
**Gráfico**: `generarGraficoRendimientoAreas()`  
**Método**: Barra horizontal con promedio de asistencia por área

#### Verificación:
- [ ] Abre **Console del navegador** (F12)
- [ ] Ve a la sección "Distribución de Docentes"
- [ ] Observa los logs con el símbolo 🎯
- [ ] **Resultado esperado**: Logs muestran datos reales
  ```
  📥 Asistencias obtenidas. Cantidad: [número > 0]
  📚 Materias obtenidas. Cantidad: [número > 0]
  ✅ Estadísticas de asistencia por área: {...}
  ```
- [ ] **Resultado problemático**: Logs muestran cantidad 0
  ```
  📥 Asistencias obtenidas. Cantidad: 0
  ⚠️ No hay áreas con datos. Mostrando gráfico de ejemplo.
  ```

### 2. 📈 Rendimiento Académico por Área
**Gráfico**: `generarGraficoComparativaMensual()` (primera sección)  
**Método**: Barras de comparación de asistencia

#### Verificación:
- [ ] Abre **Console del navegador** (F12)
- [ ] Ve a la sección "Evolución de Asistencia"
- [ ] Observa logs de `generarGraficoComparativaMensual`
- [ ] **Resultado esperado**: Logs muestran datos por meses
  ```
  🔄 Llamando a calcularEvolucionMensual()...
  ⏳ Verificando datos de evolución mensual...
  📊 evolucionAsistenciaMensual.length: [número > 0]
  ✅ Gráfico "Comparativa de Asistencia Mensual" renderizado exitosamente.
  ```
- [ ] **Resultado problemático**: Array vacío
  ```
  📊 evolucionAsistenciaMensual.length: 0
  ⚠️ No hay datos de evolución mensual. Mostrando gráfico de ejemplo.
  ```

### 3. 📉 Comparativa de Asistencia Promedio por Área
**Gráfico**: En el mismo `generarGraficoComparativaMensual()`  
**Método**: Línea de evolución mensual

#### Verificación:
- [ ] Observa los mismos logs que el punto 2
- [ ] El gráfico debe mostrar 3 líneas (Presentes, Ausentes, Tardanzas)
- [ ] Los meses en el eje X deben ser valores reales, no hardcodeados

---

## 🔧 Acciones de Debugging Paso a Paso

### Paso 1: Preparar el Navegador
```javascript
// 1. Abrir DevTools: F12
// 2. Ir a Console
// 3. Filtrar por "InformesComponent"
// En el filtro de búsqueda escribir:
InformesComponent
```

### Paso 2: Limpiar Datos Previos
```javascript
// En la consola, ejecutar:
localStorage.clear();
// Luego recargar la página: Ctrl+R o F5
```

### Paso 3: Verificar Disponibilidad de Datos
```javascript
// En la consola, ejecutar:
console.log('Asistencias:', JSON.parse(localStorage.getItem('profesort_asistencias') || '[]').length);
console.log('Materias:', JSON.parse(localStorage.getItem('profesort_materias') || '[]').length);
console.log('Docentes:', JSON.parse(localStorage.getItem('profesort_usuarios') || '[]').filter(u => u.id_rol === 2).length);

// Resultado esperado:
// Asistencias: > 0
// Materias: > 0
// Docentes: > 0
```

### Paso 4: Visualizar Estructura de Datos
```javascript
// En la consola, ejecutar:
const asistencias = JSON.parse(localStorage.getItem('profesort_asistencias') || '[]');
const materias = JSON.parse(localStorage.getItem('profesort_materias') || '[]');

console.log('Primera asistencia:', asistencias[0]);
// Debe tener: { id, id_materia, fecha, estado, ... }

console.log('Primera materia:', materias[0]);
// Debe tener: { id, nombre, area, ... }
```

### Paso 5: Monitorear Gráficos en Tiempo Real
```javascript
// En la consola, ejecutar (mantener abierto):
// Ir a cada sección y observar los logs en orden

// Para Distribución de Docentes:
// Busca mensajes que digan:
// 🎯 INICIANDO
// ✅ Canvas encontrado
// 📥 Asistencias obtenidas
// ...
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: "No hay datos"
**Síntoma**: `📥 Asistencias obtenidas. Cantidad: 0`

**Causa probable**: localStorage vacío  
**Solución**:
1. Verificar que hay datos en otras secciones (docentes, materias, etc.)
2. Si falta data, agregar registros desde la interfaz
3. Verificar que los servicios están usando localStorage correctamente

### Problema 2: "Canvas no encontrado"
**Síntoma**: `❌ Canvas "graficoRendimientoAreas" no encontrado en el DOM.`

**Causa probable**: El elemento HTML no existe  
**Solución**:
1. Verificar que `informes.html` tiene el elemento:
   ```html
   <canvas id="graficoRendimientoAreas"></canvas>
   ```
2. Comprobar que está dentro del contenedor correcto
3. Verificar CSS (display: none, visibility: hidden, etc.)

### Problema 3: "Error en servicio"
**Síntoma**: `❌ Error obteniendo asistencias: Error...`

**Causa probable**: Servicio devuelve error  
**Solución**:
1. Verificar estructura de localStorage
2. Revisar métodos del servicio (getAllAsistencias, getMaterias)
3. Validar tipos de datos

### Problema 4: "Mostrando gráfico de ejemplo"
**Síntoma**: `⚠️ MOSTRANDO GRÁFICO DE EJEMPLO - No hay datos reales disponibles`

**Causa probable**: 
- Los datos están vacíos DESPUÉS de procesarlos
- El filtro por área no encuentra coincidencias
- Temporal: datos aún se están cargando (resolver con setTimeout)

**Solución**:
1. Verificar que `evolucionAsistenciaMensual` o `areaStats` se llenan correctamente
2. Revisar que las relaciones entre tablas son correctas (id_materia, etc.)
3. Aumentar el setTimeout si es necesario (hasta 1000ms)

---

## 📊 Matriz de Decisión

| Síntoma | Ubicación en logs | Causa Probable | Acción |
|---------|------------------|----------------|--------|
| Canvas no encontrado | ❌ (primera línea) | HTML faltante | Verificar HTML |
| Cantidad 0 | 📥 / 📚 | localStorage vacío | Verificar datos |
| areaStats vacío | 🏷️ / ✅ | Sin coincidencias de área | Revisar relaciones |
| Error | ❌ | Excepción en servicio | Verificar servicio |
| setTimeout incompleto | ⏳ (sin más logs) | Async sin completar | Aumentar timeout |

---

## 🚀 Verificación Final

Después de hacer cambios, confirmar:

- [ ] **Compilación**: `npm run build` sin errores
- [ ] **No hay errores en Console**: F12 → Console, sin errores rojos
- [ ] **Logs aparecen**: Al navegar a los dashboards
- [ ] **Gráficos se renderizan**: Se ve el gráfico (no en blanco)
- [ ] **Datos son reales**: El gráfico cambia cuando se agregan/modifican datos

---

## 📝 Notas para Investigación Futura

### Si el problema persiste:
1. **Revisar servicios**:
   - `asistencia.service.ts` → `getAllAsistencias()`
   - `materias.service.ts` → `getMaterias()`
   - `informes.service.ts` → métodos de cálculo

2. **Revisar datos de ejemplo**:
   - Líneas 890-919 (Rendimiento)
   - Líneas 1040-1089 (Evolución)
   - Verificar que se usan como fallback

3. **Revisar timing**:
   - setTimeout en `generarGraficoComparativaMensual()` (actualmente 500ms)
   - Puede necesitar ser 1000ms si hay lentitud

4. **Revisar estructura de datos**:
   - Asistencias deben tener `id_materia`, `estado`, `fecha`
   - Materias deben tener `id`, `area`
   - La relación id_materia debe existir en asistencias

---

**Última actualización**: 2025-10-24  
**Versión**: 1.0
