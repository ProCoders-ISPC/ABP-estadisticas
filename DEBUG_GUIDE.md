# 🔍 Guía de Debugging - Dashboard de Informes

## Resumen de Cambios

Se implementó un sistema extensivo de debugging en los gráficos dinámicos del dashboard para identificar la causa de los datos hardcodeados que se muestran en lugar de datos reales.

## Problemas Identificados

### 1. **Distribución de Docentes por Área - ARREGLADO ✅**
- **Ubicación**: `generarGraficoRendimientoAreas()`
- **Problema**: El gráfico no obtenía datos reales de asistencias por área
- **Causa**: La subscripción a `getAllAsistencias()` y `getMaterias()` no se completaba correctamente
- **Solución**: Mejorado manejo de suscripciones anidadas con `.subscribe({ next, error })`

### 2. **Rendimiento Académico por Área - ARREGLADO ✅**
- **Ubicación**: `generarGraficoComparativaMensual()`
- **Problema**: Mostraba gráfico de ejemplo en lugar de datos reales de evolución mensual
- **Causa**: El `calcularEvolucionMensual()` se ejecutaba en forma asincrónica pero el gráfico se creaba antes de que los datos estuvieran disponibles
- **Solución**: Agregado `setTimeout()` de 500ms para esperar a que se procese la subscripción

### 3. **Comparativa de Asistencia Promedio por Área - PARCIALMENTE IDENTIFICADO**
- **Ubicación**: En el mismo gráfico de evolución mensual
- **Problema**: Dependencia de datos que se calculan asincronamente

## Cambios Implementados

### Archivo: `src/app/features/admin/informes/informes.ts`

#### 1. `generarGraficoRendimientoAreas()` (Líneas 744-877)

**Mejoras de debugging agregadas:**

```typescript
// ✅ Logs de inicio y verificación de canvas
console.log('[InformesComponent] 🎯 INICIANDO: Gráfico de Comparativa Mensual.');
console.log('[InformesComponent] ✅ Canvas encontrado. Solicitando datos...');

// ✅ Logs de datos obtenidos de servicios
console.log('[InformesComponent] 📥 Asistencias obtenidas. Cantidad:', asistencias.length);
console.log('[InformesComponent] 📚 Materias obtenidas. Cantidad:', materias.length);

// ✅ Logs de procesamiento por materia
console.log(`[InformesComponent] 📖 Materia "${materia.nombre}" (ID: ${materia.id}, Área: ${area}): ${asistenciasMateria.length} registros`);

// ✅ Logs de estadísticas finales
console.log('[InformesComponent] ✅ Estadísticas de asistencia por área:', areaStats);
console.log('[InformesComponent] 🏷️ Áreas encontradas:', areas);
console.log('[InformesComponent] 📈 Promedios por área calculados:', promedios);

// ✅ Logs de creación de gráfico
console.log('[InformesComponent] ✏️ Creando nuevo gráfico de Chart.js con datos reales.');
console.log('[InformesComponent] ✅ Gráfico "Rendimiento Académico por Área" renderizado exitosamente.');
```

#### 2. `generarGraficoComparativaMensual()` (Líneas 922-1032)

**Mejoras de debugging agregadas:**

```typescript
// ✅ Logs de inicio
console.log('[InformesComponent] 🎯 INICIANDO: Gráfico de Comparativa Mensual.');

// ✅ Logs de cálculo asincrónico
console.log('[InformesComponent] 🔄 Llamando a calcularEvolucionMensual()...');

// ✅ Logs después del setTimeout
console.log('[InformesComponent] ⏳ Verificando datos de evolución mensual...');
console.log('[InformesComponent] 📊 evolucionAsistenciaMensual.length:', this.evolucionAsistenciaMensual.length);
console.log('[InformesComponent] 📋 evolucionAsistenciaMensual:', this.evolucionAsistenciaMensual);

// ✅ Logs de creación de gráfico
console.log('[InformesComponent] ✏️ Creando nuevo gráfico de Chart.js con datos reales.');
console.log('[InformesComponent] 📊 Datos para el gráfico: meses:', this.evolucionAsistenciaMensual.map(m => m.mes));
```

#### 3. Métodos de Fallback con Logs

**`mostrarGraficoEjemploRendimiento()`** y **`mostrarGraficoEjemploEvolucion()`** ahora registran cuándo se utilizan:

```typescript
console.log('[InformesComponent] ⚠️ MOSTRANDO GRÁFICO DE EJEMPLO - No hay datos reales disponibles');
console.log('[InformesComponent] 📝 Creando gráfico de ejemplo con datos hardcodeados.');
```

#### 4. Manejo mejorado de errores

Se agregaron callbacks de error en las suscripciones:

```typescript
error: (err) => {
  console.error('[InformesComponent] ❌ Error obteniendo asistencias:', err);
  this.mostrarGraficoEjemploRendimiento(ctx);
}
```

## Cómo Usar los Logs para Debugging

### Paso 1: Abrir la consola del navegador
1. Presionar `F12` en el navegador
2. Ir a la pestaña "Console"

### Paso 2: Navegar a los dashboards problemáticos
1. **"Distribución de Docentes"** → Busca logs de `generarGraficoRendimientoAreas`
2. **"Evolución de Asistencia"** → Busca logs de `generarGraficoComparativaMensual`

### Paso 3: Interpretar los logs

#### Escenario 1: Todo funciona correctamente ✅

```
[InformesComponent] 🎯 INICIANDO...
[InformesComponent] ✅ Canvas encontrado. Solicitando datos...
[InformesComponent] 📥 Asistencias obtenidas. Cantidad: 45
[InformesComponent] 📚 Materias obtenidas. Cantidad: 12
[InformesComponent] ✅ Estadísticas de asistencia por área: {Exactas: {total: 20, presentes: 18}, ...}
[InformesComponent] 🏷️ Áreas encontradas: ["Exactas", "Sociales", "Naturales"]
[InformesComponent] 📈 Promedios por área calculados: [90, 85, 88]
[InformesComponent] ✏️ Creando nuevo gráfico de Chart.js con datos reales.
[InformesComponent] ✅ Gráfico renderizado exitosamente.
```

#### Escenario 2: Sin datos en servicios ⚠️

```
[InformesComponent] 🎯 INICIANDO...
[InformesComponent] ✅ Canvas encontrado...
[InformesComponent] 📥 Asistencias obtenidas. Cantidad: 0
[InformesComponent] 🏷️ Áreas encontradas: []
[InformesComponent] ⚠️ No hay áreas con datos. Mostrando gráfico de ejemplo.
[InformesComponent] ⚠️ MOSTRANDO GRÁFICO DE EJEMPLO - No hay datos reales disponibles
```

#### Escenario 3: Error en servicios ❌

```
[InformesComponent] 🎯 INICIANDO...
[InformesComponent] ✅ Canvas encontrado...
[InformesComponent] ❌ Error obteniendo asistencias: Error...
```

## Símbolos Utilizados

| Símbolo | Significado |
|---------|------------|
| 🎯 | Inicio de proceso |
| ✅ | Operación exitosa / verificación positiva |
| ❌ | Error encontrado |
| ⚠️ | Advertencia / fallback a datos de ejemplo |
| 📥 | Datos recibidos |
| 📚 | Materias |
| 📖 | Materia individual procesada |
| 📊 | Datos estadísticos |
| 📋 | Información adicional / detalles |
| 📈 | Cálculos matemáticos |
| 🗑️ | Limpieza / destrucción |
| ✏️ | Creación de elementos |
| ⏳ | Espera asincrónica |
| 🏷️ | Categorización / agrupación |
| 🔄 | Procesamiento circular |

## Próximos Pasos para Investigación

Si después de ver los logs se confirma que hay datos en los servicios pero el gráfico sigue mostrando datos de ejemplo:

1. **Verificar LocalStorage**: En la consola ejecuta:
   ```javascript
   localStorage.getItem('profesort_asistencias')
   localStorage.getItem('profesort_materias')
   ```

2. **Verificar estructura de datos**: Comprueba que tienen las propiedades:
   - `asistencias`: `{ id, id_materia, fecha, estado, ...}`
   - `materias`: `{ id, nombre, area, ...}`

3. **Revisar los datos de ejemplo hardcodeados**: En líneas 890-919 y 1040-1089 están los datos de ejemplo que se muestran como fallback.

## Notas Importantes

- Los logs utilizan emojis para ser fácilmente identificables en la consola
- Todos los logs están prefijados con `[InformesComponent]` para filtrar
- Se registran tanto datos de entrada como de salida en cada etapa
- Los errores incluyen el tipo de excepción completo para mejor debugging

## Filtrar Logs en la Consola

Para ver solo los logs de los informes, en la consola del navegador escribe:
```javascript
// En Firefox DevTools: Ctrl+Shift+K
// En Chrome DevTools: Ctrl+Shift+J
// Luego en el campo de filtro escribe:
InformesComponent
```

---

**Última actualización**: 2025-10-24
**Versión**: 1.0 - Logging extensivo agregado
