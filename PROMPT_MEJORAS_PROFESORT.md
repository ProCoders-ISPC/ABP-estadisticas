# 🤖 Prompt para IA Agente - Mejoras Sistema ProfeSort

## 📋 Contexto del Proyecto

Estás trabajando en **ProfeSort**, una aplicación Angular 17+ (standalone components) para gestión educativa que usa LocalStorage como base de datos temporal. El sistema tiene paneles administrativos para gestionar docentes, estudiantes, materias, asistencias e informes estadísticos.

### Stack Tecnológico:
- **Framework**: Angular 17+ con Standalone Components
- **Sintaxis**: Nueva sintaxis de control flow (@if, @for, @empty)
- **Estilos**: CSS personalizado + gradientes con paleta de colores ProfeSort
- **Datos**: LocalStorage (simulación de backend)
- **Gráficos**: Chart.js para visualizaciones
- **Íconos**: Font Awesome

### Paleta de Colores ProfeSort:
```css
--primary-dark: #043237;
--primary-medium: #0F8795;
--primary-light: #3abdcc;
--accent-teal: #1a5f6f;
--accent-blue: #2c8c9e;
--accent-cyan: #45b8c9;
--accent-deep: #0a4449;
--accent-medium: #1b7a87;
--accent-bright: #56cbd8;
```

---

## 🎯 TAREAS A IMPLEMENTAR

### **TAREA 1: Modal "Ver Más Info" para Docentes**

**Archivos a modificar:**
- `src/app/features/admin/admin-docentes/docentes.ts`
- `src/app/features/admin/admin-docentes/docentes.html`
- `src/app/features/admin/admin-docentes/docentes.css`

**Especificaciones Detalladas:**

#### 1.1 TypeScript (docentes.ts)
```typescript
// AGREGAR estas propiedades a la clase del componente:
mostrarModalInfo = false;
docenteInfo: any = null; // Usar el tipo correcto de Docente del servicio

// AGREGAR estos métodos:
verInfoDocente(docente: any): void {
  this.docenteInfo = docente;
  this.mostrarModalInfo = true;
}

cerrarModalInfo(): void {
  this.mostrarModalInfo = false;
  this.docenteInfo = null;
}

// Método auxiliar para obtener materias del docente
getMateriasDocente(docenteId: number): Observable<Materia[]> {
  return this.materiasService.getMateriasByDocente(docenteId);
}
```

#### 1.2 HTML (docentes.html)
**Ubicación**: En la columna de "Acciones" de la tabla de docentes, ANTES del botón de editar:

```html
<button 
  class="btn btn-sm btn-secondary" 
  (click)="verInfoDocente(docente)"
  title="Ver más información"
>
  <i class="fas fa-eye"></i>
</button>
```

**Modal (agregar AL FINAL del archivo, justo antes del cierre de </div> principal):**

```html
<!-- Modal de Información Detallada -->
@if (mostrarModalInfo && docenteInfo) {
  <div class="modal-overlay" (click)="cerrarModalInfo()">
    <div class="modal-info-content" (click)="$event.stopPropagation()">
      <div class="modal-info-header">
        <h3><i class="fas fa-user-tie me-2"></i>Información del Docente</h3>
        <button class="btn-close-modal" (click)="cerrarModalInfo()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-info-body">
        <!-- Datos Personales -->
        <div class="info-section">
          <h4><i class="fas fa-id-card me-2"></i>Datos Personales</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo:</span>
              <span class="info-value">{{ docenteInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Legajo:</span>
              <span class="info-value">{{ docenteInfo.legajo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">DNI:</span>
              <span class="info-value">{{ docenteInfo.dni || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ docenteInfo.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Área:</span>
              <span class="info-value">{{ docenteInfo.area || 'Sin área' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="info-value">
                <span class="badge" [class.badge-activo]="docenteInfo.is_active" [class.badge-inactivo]="!docenteInfo.is_active">
                  {{ docenteInfo.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Estadísticas Académicas -->
        <div class="info-section">
          <h4><i class="fas fa-chart-line me-2"></i>Estadísticas Académicas</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-book"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ docenteInfo.materias_count || 0 }}</span>
                <span class="stat-label">Materias Asignadas</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">0</span>
                <span class="stat-label">Estudiantes</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">-</span>
                <span class="stat-label">Asistencia Promedio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-info-footer">
        <button class="btn btn-secondary" (click)="cerrarModalInfo()">
          <i class="fas fa-times me-2"></i>Cerrar
        </button>
        <button class="btn btn-primary" (click)="editarDocente(docenteInfo); cerrarModalInfo()">
          <i class="fas fa-edit me-2"></i>Editar Docente
        </button>
      </div>
    </div>
  </div>
}
```

#### 1.3 CSS (docentes.css)
**Agregar AL FINAL del archivo:**

```css
/* ===== MODAL DE INFORMACIÓN DOCENTE ===== */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999 !important;
  animation: fadeIn 0.3s ease;
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-info-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  position: relative;
  z-index: 10000;
  margin: 20px;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-info-header {
  padding: 24px 28px;
  background: linear-gradient(135deg, #043237 0%, #0F8795 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-info-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-info-body {
  padding: 28px;
}

.info-section {
  margin-bottom: 28px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #043237 0%, #0F8795 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #043237;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.modal-info-footer {
  padding: 20px 28px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media screen and (max-width: 768px) {
  .modal-info-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-info-header,
  .modal-info-body,
  .modal-info-footer {
    padding: 16px 20px;
  }

  .stats-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
```

---

### **TAREA 2: Sistema de Edición de Asistencia - Panel Docente**

**Archivos a crear/modificar:**
- `src/app/features/docente/asistencia/asistencia.ts`
- `src/app/features/docente/asistencia/asistencia.html`
- `src/app/features/docente/asistencia/asistencia.css`
- `src/app/core/services/asistencia.service.ts`

**Especificaciones Detalladas:**

#### 2.1 Agregar al Servicio (asistencia.service.ts)

```typescript
// AGREGAR estos métodos al AsistenciaService existente:

updateAsistencia(id: number, datos: Partial<AsistenciaRegistro>): Observable<AsistenciaRegistro> {
  if (environment.useLocalStorage) {
    return new Observable(observer => {
      const asistencias = this.localStorageService.getAsistencias();
      const index = asistencias.findIndex(a => a.id === id);
      
      if (index !== -1) {
        asistencias[index] = { ...asistencias[index], ...datos };
        localStorage.setItem('profesort_asistencias', JSON.stringify(asistencias));
        observer.next(asistencias[index]);
        observer.complete();
      } else {
        observer.error(new Error('Asistencia no encontrada'));
      }
    });
  } else {
    return this.http.put<AsistenciaRegistro>(`${this.apiUrl}/asistencias/${id}`, datos);
  }
}

deleteAsistencia(id: number): Observable<void> {
  if (environment.useLocalStorage) {
    return new Observable(observer => {
      const asistencias = this.localStorageService.getAsistencias();
      const filtered = asistencias.filter(a => a.id !== id);
      localStorage.setItem('profesort_asistencias', JSON.stringify(filtered));
      observer.next();
      observer.complete();
    });
  } else {
    return this.http.delete<void>(`${this.apiUrl}/asistencias/${id}`);
  }
}

getAsistenciasByMateriaAndFecha(materiaId: number, fecha: string): Observable<AsistenciaRegistro[]> {
  if (environment.useLocalStorage) {
    return new Observable(observer => {
      const asistencias = this.localStorageService.getAsistencias();
      const filtered = asistencias.filter(a => 
        a.materiaId === materiaId && a.fecha === fecha
      );
      observer.next(filtered);
      observer.complete();
    });
  } else {
    return this.http.get<AsistenciaRegistro[]>(
      `${this.apiUrl}/asistencias/materia/${materiaId}/fecha/${fecha}`
    );
  }
}
```

#### 2.2 Componente TypeScript (asistencia.ts)

**AGREGAR estas propiedades y métodos:**

```typescript
// Nuevas propiedades para edición
modoEdicion = false;
asistenciaSeleccionada: AsistenciaRegistro | null = null;
mostrarModalEditar = false;

// Método para abrir modal de edición
editarAsistencia(asistencia: AsistenciaRegistro): void {
  this.asistenciaSeleccionada = { ...asistencia };
  this.mostrarModalEditar = true;
}

// Método para guardar cambios
guardarEdicion(): void {
  if (!this.asistenciaSeleccionada) return;
  
  this.asistenciaService.updateAsistencia(
    this.asistenciaSeleccionada.id,
    this.asistenciaSeleccionada
  ).subscribe({
    next: () => {
      this.mensaje = 'Asistencia actualizada correctamente';
      this.cerrarModalEditar();
      this.cargarAsistencias(); // Recargar lista
    },
    error: (err) => {
      this.error = 'Error al actualizar la asistencia';
    }
  });
}

// Método para eliminar asistencia
eliminarAsistencia(id: number): void {
  if (!confirm('¿Está seguro de eliminar este registro de asistencia?')) return;
  
  this.asistenciaService.deleteAsistencia(id).subscribe({
    next: () => {
      this.mensaje = 'Asistencia eliminada correctamente';
      this.cargarAsistencias();
    },
    error: (err) => {
      this.error = 'Error al eliminar la asistencia';
    }
  });
}

cerrarModalEditar(): void {
  this.mostrarModalEditar = false;
  this.asistenciaSeleccionada = null;
}
```

#### 2.3 HTML (asistencia.html)

**AGREGAR después de la tabla de asistencias:**

```html
<!-- Botón de editar en cada fila -->
<td>
  <div class="action-buttons">
    <button 
      class="btn btn-sm btn-warning" 
      (click)="editarAsistencia(registro)"
      title="Editar">
      <i class="fas fa-edit"></i>
    </button>
    <button 
      class="btn btn-sm btn-danger" 
      (click)="eliminarAsistencia(registro.id)"
      title="Eliminar">
      <i class="fas fa-trash"></i>
    </button>
  </div>
</td>

<!-- Modal de Edición AL FINAL del archivo -->
@if (mostrarModalEditar && asistenciaSeleccionada) {
  <div class="modal-overlay" (click)="cerrarModalEditar()">
    <div class="modal-content-edit" (click)="$event.stopPropagation()">
      <div class="modal-header-edit">
        <h3><i class="fas fa-edit me-2"></i>Editar Asistencia</h3>
        <button class="btn-close" (click)="cerrarModalEditar()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body-edit">
        <div class="form-group">
          <label>Estudiante:</label>
          <input type="text" 
                 [value]="asistenciaSeleccionada.estudianteNombre" 
                 disabled 
                 class="form-control">
        </div>
        
        <div class="form-group">
          <label>Fecha:</label>
          <input type="date" 
                 [(ngModel)]="asistenciaSeleccionada.fecha" 
                 class="form-control">
        </div>
        
        <div class="form-group">
          <label>Estado:</label>
          <select [(ngModel)]="asistenciaSeleccionada.estado" class="form-control">
            <option value="PRESENTE">Presente</option>
            <option value="AUSENTE">Ausente</option>
            <option value="TARDANZA">Tardanza</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Observaciones:</label>
          <textarea 
            [(ngModel)]="asistenciaSeleccionada.observaciones" 
            class="form-control"
            rows="3"
            placeholder="Agregar observaciones..."></textarea>
        </div>
      </div>
      
      <div class="modal-footer-edit">
        <button class="btn btn-secondary" (click)="cerrarModalEditar()">
          <i class="fas fa-times me-2"></i>Cancelar
        </button>
        <button class="btn btn-primary" (click)="guardarEdicion()">
          <i class="fas fa-save me-2"></i>Guardar Cambios
        </button>
      </div>
    </div>
  </div>
}
```

---

### **TAREA 3: Panel de Gestión de Asistencia - Administrador**

**Archivos a crear:**
- `src/app/features/admin/admin-asistencia/admin-asistencia.ts`
- `src/app/features/admin/admin-asistencia/admin-asistencia.html`
- `src/app/features/admin/admin-asistencia/admin-asistencia.css`

**Ruta a agregar en app.routes.ts:**
```typescript
{
  path: 'admin/asistencia',
  component: AdminAsistenciaComponent,
  canActivate: [adminGuard]
}
```

**Especificaciones:**

#### 3.1 Componente (admin-asistencia.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, AsistenciaRegistro } from 'src/app/core/services/asistencia.service';
import { MateriasService, Materia } from 'src/app/core/services/materias.service';

@Component({
  selector: 'app-admin-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-asistencia.html',
  styleUrls: ['./admin-asistencia.css']
})
export class AdminAsistenciaComponent implements OnInit {
  asistencias: AsistenciaRegistro[] = [];
  materias: Materia[] = [];
  asistenciasFiltradas: AsistenciaRegistro[] = [];
  
  // Filtros
  materiaSeleccionada = '';
  fechaInicio = '';
  fechaFin = '';
  estadoFiltro = '';
  
  // Modal
  mostrarModalEditar = false;
  asistenciaEditar: AsistenciaRegistro | null = null;
  
  cargando = false;
  mensaje = '';
  error = '';

  constructor(
    private asistenciaService: AsistenciaService,
    private materiasService: MateriasService
  ) {}

  ngOnInit(): void {
    this.cargarMaterias();
    this.cargarAsistencias();
  }

  cargarMaterias(): void {
    this.materiasService.getMaterias().subscribe({
      next: (data) => {
        this.materias = data;
      },
      error: (err) => {
        this.error = 'Error al cargar materias';
      }
    });
  }

  cargarAsistencias(): void {
    this.cargando = true;
    this.asistenciaService.getAllAsistencias().subscribe({
      next: (data) => {
        this.asistencias = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar asistencias';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.asistencias];
    
    if (this.materiaSeleccionada) {
      filtradas = filtradas.filter(a => a.materiaId.toString() === this.materiaSeleccionada);
    }
    
    if (this.fechaInicio) {
      filtradas = filtradas.filter(a => a.fecha >= this.fechaInicio);
    }
    
    if (this.fechaFin) {
      filtradas = filtradas.filter(a => a.fecha <= this.fechaFin);
    }
    
    if (this.estadoFiltro) {
      filtradas = filtradas.filter(a => a.estado === this.estadoFiltro);
    }
    
    this.asistenciasFiltradas = filtradas;
  }

  editarAsistencia(asistencia: AsistenciaRegistro): void {
    this.asistenciaEditar = { ...asistencia };
    this.mostrarModalEditar = true;
  }

  guardarEdicion(): void {
    if (!this.asistenciaEditar) return;
    
    this.asistenciaService.updateAsistencia(
      this.asistenciaEditar.id,
      this.asistenciaEditar
    ).subscribe({
      next: () => {
        this.mensaje = 'Asistencia actualizada correctamente';
        this.cerrarModalEditar();
        this.cargarAsistencias();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al actualizar la asistencia';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  eliminarAsistencia(id: number): void {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;
    
    this.asistenciaService.deleteAsistencia(id).subscribe({
      next: () => {
        this.mensaje = 'Asistencia eliminada correctamente';
        this.cargarAsistencias();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al eliminar la asistencia';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.asistenciaEditar = null;
  }

  exportarCSV(): void {
    // Implementar exportación a CSV
    const csv = this.asistenciasFiltradas.map(a => 
      `${a.estudianteNombre},${a.materiaNombre},${a.fecha},${a.estado}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${new Date().toISOString()}.csv`;
    a.click();
  }
}
```

#### 3.2 Template (admin-asistencia.html)

```html
<div class="asistencia-admin-container">
  <div class="header-section">
    <h1><i class="fas fa-clipboard-check me-2"></i>Gestión de Asistencias</h1>
    <p class="subtitle">Administra y supervisa todas las asistencias del sistema</p>
  </div>

  <!-- Alertas -->
  @if (mensaje) {
    <div class="alert alert-success">
      <i class="fas fa-check-circle me-2"></i>{{ mensaje }}
    </div>
  }
  
  @if (error) {
    <div class="alert alert-danger">
      <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
    </div>
  }

  <!-- Filtros -->
  <div class="filtros-card">
    <h3><i class="fas fa-filter me-2"></i>Filtros de Búsqueda</h3>
    <div class="filtros-grid">
      <div class="form-group">
        <label>Materia:</label>
        <select [(ngModel)]="materiaSeleccionada" 
                (change)="aplicarFiltros()" 
                class="form-control">
          <option value="">Todas las materias</option>
          @for (materia of materias; track materia.id) {
            <option [value]="materia.id">{{ materia.nombre }}</option>
          }
        </select>
      </div>
      
      <div class="form-group">
        <label>Desde:</label>
        <input type="date" 
               [(ngModel)]="fechaInicio" 
               (change)="aplicarFiltros()"
               class="form-control">
      </div>
      
      <div class="form-group">
        <label>Hasta:</label>
        <input type="date" 
               [(ngModel)]="fechaFin" 
               (change)="aplicarFiltros()"
               class="form-control">
      </div>
      
      <div class="form-group">
        <label>Estado:</label>
        <select [(ngModel)]="estadoFiltro" 
                (change)="aplicarFiltros()" 
                class="form-control">
          <option value="">Todos</option>
          <option value="PRESENTE">Presente</option>
          <option value="AUSENTE">Ausente</option>
          <option value="TARDANZA">Tardanza</option>
        </select>
      </div>
    </div>
    
    <div class="filtros-actions">
      <button class="btn btn-secondary" (click)="materiaSeleccionada=''; fechaInicio=''; fechaFin=''; estadoFiltro=''; aplicarFiltros()">
        <i class="fas fa-redo me-2"></i>Limpiar Filtros
      </button>
      <button class="btn btn-success" (click)="exportarCSV()">
        <i class="fas fa-file-csv me-2"></i>Exportar CSV
      </button>
    </div>
  </div>

  <!-- Tabla de Asistencias -->
  @if (cargando) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando asistencias...</p>
    </div>
  }

  @if (!cargando) {
    <div class="table-card">
      <div class="table-header">
        <h3><i class="fas fa-table me-2"></i>Registros de Asistencia</h3>
        <span class="badge badge-primary">{{ asistenciasFiltradas.length }} registros</span>
      </div>
      
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Materia</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (asistencia of asistenciasFiltradas; track asistencia.id) {
              <tr>
                <td>{{ asistencia.estudianteNombre }}</td>
                <td>{{ asistencia.materiaNombre }}</td>
                <td>{{ asistencia.fecha | date: 'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" 
                        [class.badge-presente]="asistencia.estado === 'PRESENTE'"
                        [class.badge-ausente]="asistencia.estado === 'AUSENTE'"
                        [class.badge-tardanza]="asistencia.estado === 'TARDANZA'">
                    {{ asistencia.estado }}
                  </span>
                </td>
                <td>{{ asistencia.observaciones || '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" 
                            (click)="editarAsistencia(asistencia)"
                            title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            (click)="eliminarAsistencia(asistencia.id)"
                            title="Eliminar">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="text-center">
                  <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No se encontraron registros de asistencia</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

  <!-- Modal de Edición -->
  @if (mostrarModalEditar && asistenciaEditar) {
    <div class="modal-overlay" (click)="cerrarModalEditar()">
      <div class="modal-content-edit" (click)="$event.stopPropagation()">
        <div class="modal-header-edit">
          <h3><i class="fas fa-edit me-2"></i>Editar Asistencia</h3>
          <button class="btn-close" (click)="cerrarModalEditar()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-edit">
          <div class="form-group">
            <label>Estudiante:</label>
            <input type="text" 
                   [value]="asistenciaEditar.estudianteNombre" 
                   disabled 
                   class="form-control">
          </div>
          
          <div class="form-group">
            <label>Materia:</label>
            <input type="text" 
                   [value]="asistenciaEditar.materiaNombre" 
                   disabled 
                   class="form-control">
          </div>
          
          <div class="form-group">
            <label>Fecha:</label>
            <input type="date" 
                   [(ngModel)]="asistenciaEditar.fecha" 
                   class="form-control">
          </div>
          
          <div class="form-group">
            <label>Estado:</label>
            <select [(ngModel)]="asistenciaEditar.estado" class="form-control">
              <option value="PRESENTE">Presente</option>
              <option value="AUSENTE">Ausente</option>
              <option value="TARDANZA">Tardanza</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Observaciones:</label>
            <textarea 
              [(ngModel)]="asistenciaEditar.observaciones" 
              class="form-control"
              rows="3"
              placeholder="Agregar observaciones..."></textarea>
          </div>
        </div>
        
        <div class="modal-footer-edit">
          <button class="btn btn-secondary" (click)="cerrarModalEditar()">
            <i class="fas fa-times me-2"></i>Cancelar
          </button>
          <button class="btn btn-primary" (click)="guardarEdicion()">
            <i class="fas fa-save me-2"></i>Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  }
</div>
```

---

### **TAREA 4: Dos Nuevas Estadísticas en Panel de Informes**

**Archivo a modificar:**
- `src/app/features/admin/informes/informes.ts`
- `src/app/features/admin/informes/informes.html`

**Especificaciones Detalladas:**

#### 4.1 TypeScript (informes.ts)

**AGREGAR estos métodos:**

```typescript
// Estadística 1: Rendimiento Académico por Área
generarGraficoRendimientoAreas(): void {
  const ctx = document.getElementById('graficoRendimientoAreas') as HTMLCanvasElement;
  if (!ctx) return;

  // Datos simulados o reales desde el servicio
  const areas = ['Exactas', 'Sociales', 'Naturales', 'Humanidades', 'Tecnología'];
  const promedios = [78, 85, 72, 88, 92]; // Obtener datos reales del servicio
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: areas,
      datasets: [{
        label: 'Promedio de Asistencia por Área (%)',
        data: promedios,
        backgroundColor: [
          '#043237',
          '#0F8795',
          '#3abdcc',
          '#1a5f6f',
          '#2c8c9e'
        ],
        borderColor: [
          '#043237',
          '#0F8795',
          '#3abdcc',
          '#1a5f6f',
          '#2c8c9e'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Rendimiento Académico por Área',
          font: {
            size: 18,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// Estadística 2: Comparativa Mensual de Asistencia
generarGraficoComparativaMensual(): void {
  const ctx = document.getElementById('graficoComparativaMensual') as HTMLCanvasElement;
  if (!ctx) return;

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
  const presentes = [85, 88, 82, 90, 87, 89];
  const ausentes = [10, 8, 12, 7, 9, 8];
  const tardanzas = [5, 4, 6, 3, 4, 3];
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Presentes',
          data: presentes,
          borderColor: '#043237',
          backgroundColor: 'rgba(4, 50, 55, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Ausentes',
          data: ausentes,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Tardanzas',
          data: tardanzas,
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Evolución Mensual de Asistencia',
          font: {
            size: 18,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}
```

#### 4.2 HTML (informes.html)

**AGREGAR después de los gráficos existentes:**

```html
<!-- Nueva Estadística 1: Rendimiento por Área -->
<div class="chart-section">
  <div class="section-header">
    <h3><i class="fas fa-chart-bar me-2"></i>Rendimiento Académico por Área</h3>
    <p class="section-description">Comparativa de asistencia promedio entre diferentes áreas de conocimiento</p>
  </div>
  <div class="chart-container" style="height: 400px;">
    <canvas id="graficoRendimientoAreas"></canvas>
  </div>
</div>

<!-- Nueva Estadística 2: Comparativa Mensual -->
<div class="chart-section">
  <div class="section-header">
    <h3><i class="fas fa-chart-line me-2"></i>Evolución Mensual de Asistencia</h3>
    <p class="section-description">Tendencia de asistencia a lo largo de los últimos 6 meses</p>
  </div>
  <div class="chart-container" style="height: 400px;">
    <canvas id="graficoComparativaMensual"></canvas>
  </div>
  
  <!-- Tarjetas de resumen -->
  <div class="stats-cards-row">
    <div class="stat-card-mini success">
      <div class="stat-icon">
        <i class="fas fa-arrow-up"></i>
      </div>
      <div class="stat-data">
        <span class="stat-value">+5%</span>
        <span class="stat-label">Mejora Mensual</span>
      </div>
    </div>
    
    <div class="stat-card-mini info">
      <div class="stat-icon">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-data">
        <span class="stat-value">87%</span>
        <span class="stat-label">Promedio Global</span>
      </div>
    </div>
    
    <div class="stat-card-mini warning">
      <div class="stat-icon">
        <i class="fas fa-clock"></i>
      </div>
      <div class="stat-data">
        <span class="stat-value">4.5%</span>
        <span class="stat-label">Tardanzas</span>
      </div>
    </div>
  </div>
</div>
```

**AGREGAR al ngAfterViewInit() o método de inicialización:**

```typescript
ngAfterViewInit(): void {
  // Gráficos existentes...
  this.generarGraficoRendimientoAreas();
  this.generarGraficoComparativaMensual();
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Verifica que completes cada punto:

- [ ] **Tarea 1: Modal Docentes**
  - [ ] Agregar propiedades al componente
  - [ ] Implementar métodos verInfoDocente() y cerrarModalInfo()
  - [ ] Agregar botón "Ver más" en la tabla
  - [ ] Crear estructura del modal en HTML
  - [ ] Agregar estilos CSS completos
  - [ ] Probar funcionamiento y animaciones

- [ ] **Tarea 2: Edición Asistencia Docente**
  - [ ] Agregar métodos al servicio de asistencia
  - [ ] Implementar propiedades en componente
  - [ ] Crear métodos editarAsistencia(), guardarEdicion(), eliminarAsistencia()
  - [ ] Agregar botones de acción en tabla
  - [ ] Implementar modal de edición
  - [ ] Probar CRUD completo

- [ ] **Tarea 3: Panel Admin Asistencia**
  - [ ] Crear componente completo
  - [ ] Implementar sistema de filtros
  - [ ] Crear tabla con acciones
  - [ ] Implementar modal de edición
  - [ ] Agregar exportación a CSV
  - [ ] Agregar ruta en app.routes.ts
  - [ ] Probar funcionalidad completa

- [ ] **Tarea 4: Nuevas Estadísticas**
  - [ ] Implementar gráfico de rendimiento por área
  - [ ] Implementar gráfico de evolución mensual
  - [ ] Agregar tarjetas de resumen
  - [ ] Integrar con datos reales del servicio
  - [ ] Verificar colores y diseño
  - [ ] Probar responsividad

---

## 📝 NOTAS IMPORTANTES

1. **Imports**: Asegúrate de importar todos los módulos necesarios (CommonModule, FormsModule, ReactiveFormsModule)

2. **Servicios**: Verifica que todos los servicios estén inyectados correctamente

3. **Colores**: Usa la paleta ProfeSort en todos los componentes nuevos

4. **Responsividad**: Todos los componentes deben ser responsive (max-width: 768px)

5. **Validaciones**: Implementa validaciones en todos los formularios

6. **Mensajes**: Usa sistema de alertas para feedback al usuario

7. **Animaciones**: Mantén las animaciones suaves (0.3s ease)

8. **z-index**: Modales deben tener z-index: 9999

9. **LocalStorage**: Todos los cambios deben persistir en LocalStorage

10. **Pruebas**: Prueba cada funcionalidad después de implementarla

---

## 🎯 RESULTADO ESPERADO

Al completar todas las tareas, el sistema tendrá:

✅ Modal informativo completo para docentes
✅ Sistema de edición de asistencias desde panel docente  
✅ Panel administrativo completo para gestionar asistencias
✅ Dos gráficos estadísticos nuevos con visualización atractiva
✅ Exportación de datos a CSV
✅ Sistema de filtros avanzado
✅ Interfaz responsive y moderna
✅ Persistencia completa en LocalStorage

---

**Fecha de creación**: 11 de octubre de 2025
**Versión del prompt**: 1.0
**Proyecto**: ProfeSort - Sistema de Gestión Educativa
