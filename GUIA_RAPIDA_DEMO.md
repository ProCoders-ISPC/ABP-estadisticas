# 🎯 GUÍA RÁPIDA - DATOS DE DEMOSTRACIÓN

## 🚀 CARGA RÁPIDA (3 pasos)

### Paso 1: Abrir Consola
Presiona `F12` → pestaña **Console**

### Paso 2: Cargar Datos
```javascript
cargarDatosDemo()
```

### Paso 3: Recargar
```javascript
location.reload()
```

## 📊 ALERTAS GENERADAS

### 🔴 6 CRÍTICAS
- 3 estudiantes con asistencia < 60%
- 2 docentes sobrecargados (7-8 materias)
- 10 materias sin asignar

### 🟡 6 ADVERTENCIAS
- 2 estudiantes asistencia 60-70%
- 2 docentes subutilizados (1 materia)
- Desviación estándar alta (σ = 2.4)
- Coeficiente de variación alto (CV = 68%)

## 🛠️ COMANDOS

| Comando | Acción |
|---------|--------|
| `cargarDatosDemo()` | Carga datos demo |
| `verAlertas()` | Lista alertas esperadas |
| `verEstadisticas()` | Muestra resumen |
| `resetearSistema()` | Limpia todo |

## 🎬 FLUJO EXPOSICIÓN

1. `cargarDatosDemo()` + `location.reload()`
2. Ir a Panel Admin → Ver alertas
3. Click "Ver y Corregir" → Resaltado verde
4. Ir a Informes → Ver estadísticas
5. `resetearSistema()` para repetir

## 💡 TIPS

- Banner muestra top 5 alertas por prioridad
- Arrastra el slider para ver todas
- Cada panel filtra sus alertas relevantes
- Gráficos muestran todas las áreas dinámicamente
