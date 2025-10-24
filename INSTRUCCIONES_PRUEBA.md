# 🧪 INSTRUCCIONES PARA PROBAR EL SISTEMA

## Pasos para Verificar que Todo Funciona

### 1️⃣ Iniciar el Servidor

```bash
ng serve
```

Espera a que compile completamente. Deberías ver:
```
✔ Compiled successfully.
```

---

### 2️⃣ Abrir el Sistema

1. Abre tu navegador
2. Ve a: `http://localhost:4200`
3. El sistema debería cargar sin errores

---

### 3️⃣ Iniciar Sesión

**Usuario Administrador:**
- Email: `admin@ispc.edu.ar`
- Contraseña: `admin123`

O cualquier otro usuario administrador que tengas configurado.

---

### 4️⃣ Navegar a Informes

1. Desde el menú principal, busca la opción **"Informes"**
2. Haz clic para acceder al dashboard de informes

---

### 5️⃣ Probar el Sistema de Alertas

1. En el selector de informes, elige: **"🚨 Sistema de Alertas y Recomendaciones"**

**Deberías ver:**
- ✅ Tarjetas de resumen con total de alertas
- ✅ Filtros por tipo (Todas, Críticas, Advertencias, Informativas)
- ✅ Lista de alertas con colores
- ✅ Botón "Actualizar" funcional

**Prueba:**
- Haz clic en el botón de expandir (▼) de una alerta
- Verifica que se muestren los detalles adicionales
- Prueba los diferentes filtros
- Verifica que los colores correspondan al tipo de alerta

---

### 6️⃣ Probar Dashboard de Carga Académica

1. En el selector, elige: **"Carga Académica por Docente"**

**Deberías ver:**
- ✅ 9 tarjetas de métricas estadísticas
- ✅ Cada tarjeta con icono de información (i)
- ✅ Colores diferentes según el valor (verde, azul, amarillo, rojo)
- ✅ Caja de interpretación automática al final

**Prueba:**
- Pasa el cursor sobre los iconos de información
- Verifica que aparezcan los tooltips
- Lee la interpretación automática al final
- Verifica que los colores sean coherentes con los valores

---

### 7️⃣ Probar Dashboard de Estudiantes

1. En el selector, elige: **"Estudiantes y Asistencia"**

**Deberías ver:**
- ✅ Tabla de estudiantes con ranking
- ✅ Filas con colores de fondo (verde/amarillo/rojo)
- ✅ Iconos de estado al lado de cada nombre
- ✅ Badges de estado con colores
- ✅ Top 3 con badge dorado

**Prueba:**
- Observa las filas con diferentes colores
- Verifica que los iconos cambien según el porcentaje
- Verifica que el top 3 tenga el badge dorado
- Pasa el cursor sobre las barras de progreso

---

### 8️⃣ Probar Otros Informes

**Distribución de Docentes por Área:**
- Debería mostrar gráfico de barras
- Tabla con datos detallados
- Interpretación del análisis

**Distribución de Materias:**
- Tarjetas de estadísticas
- Gráfico de barras
- Gráfico comparativo (Asignadas vs Sin Asignar)
- Gráfico de varianza (radar)
- Interpretación del análisis de varianza

---

## ✅ Checklist de Verificación

### Funcionalidades Básicas:
- [ ] El sistema carga sin errores
- [ ] Puedo iniciar sesión correctamente
- [ ] Puedo navegar a la sección de Informes
- [ ] El selector de informes funciona
- [ ] Todos los tipos de informes cargan

### Sistema de Alertas:
- [ ] Las alertas se muestran correctamente
- [ ] Los filtros funcionan
- [ ] Las alertas se pueden expandir/colapsar
- [ ] Los colores son correctos (rojo=crítica, amarillo=advertencia, azul=informativa)
- [ ] Se muestran los datos adicionales al expandir
- [ ] Las recomendaciones son visibles

### Métricas Estadísticas:
- [ ] Se muestran las 9 tarjetas de métricas
- [ ] Los tooltips aparecen al pasar el cursor
- [ ] Los colores reflejan correctamente el estado
- [ ] La interpretación automática es visible
- [ ] Los valores son coherentes

### Código de Colores:
- [ ] Filas de estudiantes con colores de fondo
- [ ] Verde para asistencia ≥80%
- [ ] Amarillo para asistencia 60-79%
- [ ] Rojo para asistencia <60%
- [ ] Iconos de estado correctos
- [ ] Badges de estado con colores

### Gráficos:
- [ ] Todos los gráficos renderizan correctamente
- [ ] Los datos son coherentes
- [ ] No hay errores en consola

---

## 🐛 Posibles Problemas y Soluciones

### Problema: "No hay alertas"
**Causa:** No hay datos suficientes en el sistema
**Solución:** 
1. Asegúrate de tener estudiantes con asistencia registrada
2. Verifica que haya materias y docentes en el sistema
3. Si es necesario, agrega datos de prueba

### Problema: "Los gráficos no se muestran"
**Causa:** Chart.js no se cargó correctamente
**Solución:**
1. Verifica que `chart.js` esté instalado: `npm list chart.js`
2. Si no está: `npm install chart.js`
3. Reinicia el servidor

### Problema: "Error en consola sobre AlertasService"
**Causa:** El servicio no está importado correctamente
**Solución:** Ya está resuelto en el código, pero verifica que el archivo existe en `src/app/core/services/alertas.service.ts`

### Problema: "Las tarjetas no muestran tooltips"
**Causa:** El atributo `title` no se está aplicando
**Solución:** Verifica que estés usando un navegador moderno (Chrome, Firefox, Edge actualizado)

### Problema: "Los colores no se ven"
**Causa:** Los estilos CSS no se cargaron
**Solución:**
1. Verifica que el archivo `informes.css` existe
2. Limpia la caché del navegador (Ctrl + F5)
3. Reinicia el servidor

---

## 📱 Prueba en Diferentes Navegadores

Recomendado probar en:
- ✅ Google Chrome (recomendado)
- ✅ Microsoft Edge
- ✅ Mozilla Firefox

---

## 🔍 Verificación en Consola del Navegador

Abre la consola del navegador (F12) y verifica:

**NO deberías ver:**
- ❌ Errores en rojo
- ❌ Warnings de módulos faltantes
- ❌ Errores de servicios no encontrados

**Es normal ver:**
- ℹ️ Logs informativos del sistema
- ℹ️ Mensajes de Angular en desarrollo

---

## 💾 Datos de Prueba

Si necesitas datos para probar, el sistema debería tener:
- Al menos 5 estudiantes con asistencia registrada
- Al menos 3 docentes con materias asignadas
- Al menos 10 materias en el sistema
- Registros de asistencia variados (algunos altos, algunos bajos)

Si faltan datos, ve a las secciones de:
- Gestión de Estudiantes
- Gestión de Docentes
- Gestión de Materias
- Registro de Asistencia

Y crea algunos registros de prueba.

---

## 🎯 Prueba Específica para la Demo

### Escenario de Prueba Completo:

1. **Ir a Alertas**
   - Debería haber al menos 1 alerta visible
   - Expandir una alerta crítica
   - Leer la recomendación en voz alta

2. **Ir a Carga Académica**
   - Observar las 9 métricas
   - Pasar el cursor sobre 2-3 tooltips
   - Leer la interpretación automática
   - Verificar que los colores sean coherentes

3. **Ir a Estudiantes y Asistencia**
   - Observar la tabla con colores
   - Identificar estudiantes en zona roja
   - Verificar el ranking top 3

4. **Volver a Alertas**
   - Mostrar cómo el sistema detectó los mismos problemas
   - Explicar la conexión entre datos y alertas

---

## ✨ Si Todo Funciona Correctamente

Deberías poder:
1. ✅ Navegar entre todos los tipos de informes
2. ✅ Ver alertas clasificadas por prioridad
3. ✅ Expandir alertas y ver detalles
4. ✅ Ver 9 métricas estadísticas con tooltips
5. ✅ Ver interpretaciones automáticas
6. ✅ Ver código de colores en toda la interfaz
7. ✅ Ver gráficos renderizados correctamente
8. ✅ Ver recomendaciones específicas

---

## 📞 Si Necesitas Ayuda

Si encuentras algún problema:
1. Verifica la consola del navegador (F12)
2. Verifica que el servidor esté corriendo
3. Verifica que todos los archivos existen
4. Intenta limpiar caché y recargar
5. Reinicia el servidor

---

## 🎉 Sistema Listo para la Demo

Si todas las verificaciones pasaron, el sistema está **100% listo** para tu presentación.

**¡Éxito en tu defensa! 🚀**
