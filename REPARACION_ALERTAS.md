# 🚨 Reparación del Sistema de Alertas

## Problema Reportado
El banner de advertencias no mostraba alertas suficientes. Por ejemplo:
- Al crear una materia sin asignar docente, NO mostraba alerta
- El sistema solo alertaba si había **más de 5 materias sin asignar**
- No detectaba docentes subutilizados
- El banner no resaltaba visualmente el área problemática

## ✅ Soluciones Implementadas

### 1️⃣ Bajada de Umbral de Detección

**Antes:**
```typescript
if (metricas.materias_sin_asignar > 5 || metricas.porcentaje_sin_asignar > 10)
```

**Ahora:**
```typescript
if (metricas.materias_sin_asignar >= 1)  // ¡Incluso 1 materia sin asignar!
```

**Cambios:**
- ✅ Detecta ahora CUALQUIER materia sin asignar (1, 2, 3... todas)
- ✅ Tipo de alerta dinámico:
  - 1-3 materias = **ADVERTENCIA** (prioridad 3)
  - 4+ materias = **CRÍTICA** (prioridad 4)
- ✅ Mensajes específicos según cantidad

### 2️⃣ Nueva Alerta: Docentes Subutilizados

**Agregado:**
```typescript
// Detectar docentes con < 2 materias asignadas
if (docentesSubutilizados > 0) {
  alertas.push({
    tipo: 'advertencia',
    categoria: 'carga_docente',
    titulo: 'Docente(s) subutilizado(s)',
    descripcion: `${docentesSubutilizados} docente(s) con menos de 2 materias`,
    prioridad: 2
  });
}
```

**Beneficios:**
- ✅ Identifica recursos subutilizados
- ✅ Sugiere optimización de asignaciones
- ✅ Ayuda a balancear carga docente

### 3️⃣ Resaltado Visual Mejorado

**Implementado:**
```typescript
private resaltarYScroll(seccion: string, alerta: Alerta): void {
  // 1. Buscar elemento a resaltar
  const elemento = document.querySelector(`[data-alerta-${seccion}]`);
  
  // 2. Agregar clase de resaltado
  elemento.classList.add('alerta-highlight');
  
  // 3. Scroll suave hasta el elemento
  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // 4. Parpadeo visual por 5 segundos
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      elemento.classList.toggle('alerta-highlight-pulse');
    }, 500 * i);
  }
}
```

**Características:**
- ✅ Navegación automática a sección problemática
- ✅ Scroll suave y centrado
- ✅ Efecto parpadeo de 5 segundos
- ✅ Fondo amarillo/rojo según tipo

### 4️⃣ Estilos CSS para Resaltado

```css
.alerta-highlight {
  background-color: #fff3cd !important;
  border: 3px solid #ffc107 !important;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.8) !important;
}

@keyframes alertaPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 193, 7, 1);
  }
}
```

---

## 📋 Cambios por Archivo

### `alertas-estadisticas.service.ts`
- ✅ Línea 410: Umbral bajado de `> 5` a `>= 1`
- ✅ Línea 414: Tipo de alerta dinámico según cantidad
- ✅ Línea 435-467: Nueva lógica para docentes subutilizados

### `banner-alertas.ts`
- ✅ Línea 237-287: Mejorada función `ejecutarAccionAlerta()`
- ✅ Línea 289-321: Nueva función `resaltarYScroll()`
- ✅ Añadidos querys con filtros 'sobrecargados' y 'subutilizados'

### `banner-alertas.css`
- ✅ Línea 203-250: Nuevos estilos para resaltado visual
- ✅ Animaciones `alertaPulse` y `alertaPulseCritica`

---

## 🧪 Cómo Probar

### Caso 1: Una materia sin asignar
```javascript
// 1. Ejecutar reset de datos
resetData()

// 2. Crear una nueva materia
// Panel: Admin → Materias → Nuevo

// 3. NO asignar docente

// 4. Verificar
// ✅ Banner mostrará alerta "Materia sin asignar detectada"
// ✅ Al hacer click, navegará a Materias y resaltará la tabla
```

### Caso 2: Docente subutilizado
```javascript
// 1. Ejecutar reset de datos
resetData()

// 2. Crear un docente nuevo
// Panel: Admin → Docentes → Nuevo

// 3. NO asignar ninguna materia

// 4. Verificar
// ✅ Banner mostrará alerta "Docente subutilizado"
// ✅ Al hacer click, navegará a Docentes y resaltará el docente
```

### Caso 3: Resaltado visual
```javascript
// 1. Con datos cargados
resetData()

// 2. Buscar cualquier alerta en el banner
// Ejemplo: "Materias sin asignar"

// 3. Hacer click en el botón de la alerta

// 4. Observar
// ✅ Página navega automáticamente
// ✅ Scroll suave hasta la sección problemática
// ✅ Elemento se resalta con brillo amarillo/rojo
// ✅ Efecto parpadea 3 veces (5 segundos total)
```

---

## 🎯 Resultados Esperados

| Escenario | Antes | Después |
|-----------|-------|---------|
| 1 materia sin asignar | ❌ No alerta | ✅ Alerta ADVERTENCIA |
| 5 materias sin asignar | ❌ No alerta | ✅ Alerta CRÍTICA |
| Docente con 1 materia | ❌ No alerta | ✅ Alerta ADVERTENCIA |
| Click en alerta | ❌ Solo navega | ✅ Navega + resalta + scroll |
| Resaltado visual | ❌ Ninguno | ✅ Brillo + parpadeo |

---

## 📊 Alertas Ahora Generadas

| Tipo | Categoría | Condición | Prioridad |
|------|-----------|-----------|-----------|
| 🔴 CRÍTICA | Asistencia | Estudiantes < 60% | 4 |
| 🟠 ADVERTENCIA | Asistencia | Estudiantes 60-75% | 3 |
| 🔴 CRÍTICA | Carga Docente | Desviación σ > 1.5 | 4 |
| 🔴 CRÍTICA | Carga Docente | Docentes sobrecargados | 4 |
| 🟠 ADVERTENCIA | Materias | **1+ materias sin asignar** ⭐ | **3-4** |
| 🟠 ADVERTENCIA | Carga Docente | **Docentes subutilizados** ⭐ | **2** |
| 🟠 ADVERTENCIA | Distribución | CV áreas > 50% | 2 |

⭐ = Nuevas o mejoradas en esta reparación

---

## 🔧 Pruebas Pendientes

- [ ] Verificar que `materia-agregada` evento se dispara correctamente
- [ ] Confirmar que el banner recarga cuando se dispara el evento
- [ ] Probar resaltado en diferentes tamaños de pantalla
- [ ] Validar que el scroll funciona correctamente en móvil

---

## 📝 Notas Técnicas

1. **Umbral >= 1**: La alerta ahora se dispara con ANY materia sin asignar
2. **Eventos**: El banner escucha: `datos-actualizados`, `materia-agregada`, `materia-eliminada`, etc.
3. **Scroll**: Usa `scrollIntoView()` con `block: 'center'` para centrar el elemento
4. **Resaltado**: Aplica clase `alerta-highlight` durante 5 segundos
5. **Animación**: Pulsa 3 veces cada 500ms (total 1.5s de animación)

---

**Fecha**: 2025-10-24  
**Estado**: ✅ Completado  
**Próxima acción**: Validar funcionamiento con datos reales
