
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MateriasService, Materia, DocenteSimple } from '../../../core/services/materias.service';
import { AsignacionesService } from '../../../core/services/asignaciones.service';
import { APP_CONFIG } from '../../../core/config/app.config';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BannerAlertasComponent } from '../../../shared/components/banner-alertas/banner-alertas';

export interface Area {
  valor: string;
  nombre: string;
  descripcion?: string;
  color?: string;
}

@Component({
  selector: 'app-materias',
  standalone: true,
  templateUrl: './materias.html',
  styleUrls: ['./materias.css'],
  imports: [CommonModule, FormsModule, BannerAlertasComponent]
})
export class Materias implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Sistema de pestañas
  pestanaActiva: 'materias' | 'areas' = 'materias';
  
  materias: Materia[] = [];
  editandoId: number | null = null;
  eliminarId: number | null = null;
  alertSuccess = '';
  alertError = '';
  showEliminar = false;
  cargandoDatos = false;
  
  mostrarFormulario = false;
  modoEdicion = false;

  // Búsqueda y selección de docentes
  docentes: DocenteSimple[] = [];
  docentesFiltrados: DocenteSimple[] = [];
  docenteSeleccionado: DocenteSimple | null = null;
  busquedaDocente = '';
  mostrarListaDocentes = false;

  // Gestión de Áreas
  areasDisponibles: Area[] = [];
  areaEditando: Area | null = null;
  mostrarFormularioArea = false;
  modoEdicionArea = false;
  showEliminarArea = false;
  areaEliminarValor = '';
  
  formDataArea: Partial<Area> = {
    valor: '',
    nombre: '',
    descripcion: '',
    color: '#667eea'
  };

  // Asignación masiva
  materiasPorArea: { [key: string]: Materia[] } = {};
  areaSeleccionadaAsignacion = '';

  // Configuraciones desde APP_CONFIG
  private readonly timeouts = APP_CONFIG.TIMEOUTS;
  private readonly errorMessages = APP_CONFIG.ERROR_MESSAGES;
  private readonly successMessages = APP_CONFIG.SUCCESS_MESSAGES;
  private readonly validationConfig = APP_CONFIG.VALIDATION;

  formData: Partial<Materia> = {
    nombre: '',
    codigo: '',
    area: ''
  };

  private materiasService = inject(MateriasService);
  private asignacionesService = inject(AsignacionesService);

  constructor() {
    this.cargarAreas();
    this.initializeData();
  }

  private initializeData(): void {
    // Cargar datos de manera optimizada
    this.cargarDocentes();
    this.cargarMaterias();
  }

  // ==================== PESTAÑAS ====================
  cambiarPestana(pestana: 'materias' | 'areas'): void {
    this.pestanaActiva = pestana;
    this.cerrarFormulario();
    this.cerrarFormularioArea();
  }

  cargarMaterias(): void {
    if (this.cargandoDatos) return;
    
    console.log('[Materias] Recargando materias...');
    this.cargandoDatos = true;
    this.alertError = '';
    
    this.materiasService.getMaterias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Materia[]) => {
          console.log('[Materias] Materias cargadas con éxito.', data);
          this.materias = data;
          this.agruparMateriasPorArea();
          this.cargandoDatos = false;
        },
        error: (err) => {
          console.error('[Materias] Error cargando materias:', err);
          this.materias = [];
          this.cargandoDatos = false;
          this.showError(this.errorMessages.NETWORK_ERROR);
        }
      });
  }

  cargarDocentes(): void {
    console.log('[Materias] Cargando docentes...');
    this.materiasService.getDocentes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DocenteSimple[]) => {
          console.log('[Materias] Docentes cargados con éxito.', data);
          this.docentes = data;
          this.docentesFiltrados = [...data];
        },
        error: (err) => {
          console.error('[Materias] Error cargando docentes:', err);
          this.docentes = [];
          this.docentesFiltrados = [];
        }
      });
  }

  filtrarDocentes(): void {
    const termino = this.busquedaDocente.toLowerCase().trim();
    
    if (!termino) {
      this.docentesFiltrados = [...this.docentes]; // Crear copia
      this.mostrarListaDocentes = false;
      return;
    }

    this.mostrarListaDocentes = true;
    this.docentesFiltrados = this.docentes.filter(docente => 
      docente.name.toLowerCase().includes(termino) ||
      docente.legajo.toLowerCase().includes(termino) ||
      (docente.dni && docente.dni.includes(termino))
    );
  }

  seleccionarDocente(docente: DocenteSimple): void {
    this.docenteSeleccionado = docente;
    this.busquedaDocente = '';
    this.mostrarListaDocentes = false;
  }

  quitarDocente(): void {
    this.docenteSeleccionado = null;
    this.busquedaDocente = '';
  }

  get sinMaterias(): boolean {
    return !this.cargandoDatos && this.materias.length === 0;
  }
  
  abrirFormularioNuevo(): void {
    console.log('🚀 abrirFormularioNuevo() ejecutado');
    console.log('Estado antes - mostrarFormulario:', this.mostrarFormulario);
    this.modoEdicion = false;
    this.resetForm();
    this.mostrarFormulario = true; // Establecer después de resetForm
    console.log('Estado después - mostrarFormulario:', this.mostrarFormulario);
  }
  
  abrirFormularioEdicion(materia: Materia): void {
    this.mostrarFormulario = true;
    this.modoEdicion = true;
    this.formData = { ...materia };
    this.editandoId = materia.id;
    
    // Cargar docente si está asignado
    if (materia.docenteId) {
      const docente = this.docentes.find(d => d.id === materia.docenteId);
      if (docente) {
        this.docenteSeleccionado = docente;
      }
    }
  }
  
  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    // Pequeño delay para evitar errores de validación durante la transición
    setTimeout(() => {
      this.resetForm();
    }, 100);
  }

  guardar(): void {
    if (this.cargandoDatos) return; // Prevenir envíos múltiples
    
    console.log('Método guardar() ejecutado');
    console.log('Modo edición:', this.modoEdicion);
    console.log('Editando ID:', this.editandoId);
    console.log('Form data:', this.formData);
    console.log('Docente seleccionado:', this.docenteSeleccionado);
    
    // Validar campos requeridos usando configuración
    if (!this.formData.nombre?.trim() || !this.formData.codigo?.trim()) {
      console.log('Error de validación: campos requeridos vacíos');
      this.showError(this.errorMessages.VALIDATION_ERROR);
      return;
    }
    
    console.log('Validación pasada, continuando...');
    this.alertError = '';
    this.cargandoDatos = true;

    if (this.modoEdicion && this.editandoId) {
      console.log('Enviando actualización con datos:', this.formData);
      
      // Actualizar datos básicos de la materia (sin docente)
      const materiaData = {
        nombre: this.formData.nombre,
        codigo: this.formData.codigo,
        horas_semanales: this.formData.horas_semanales,
        area: this.formData.area,
        nivel: this.formData.nivel
      };
      
      this.materiasService.updateMateria(this.editandoId, materiaData).pipe(
        switchMap(() => {
          // Después de actualizar la materia, manejar la asignación del docente
          const docenteId = this.docenteSeleccionado ? this.docenteSeleccionado.id : null;
          return this.materiasService.asignarDocente(this.editandoId!, docenteId);
        })
      ).subscribe({
        next: (response) => {
          console.log('Materia y asignación actualizadas exitosamente:', response);
          this.showMessage(this.successMessages.UPDATE_SUCCESS);
          this.resetForm();
          this.cargandoDatos = false;
          
          // Disparar eventos para actualizar informes
          window.dispatchEvent(new CustomEvent('materia-actualizada', {
            detail: { materiaId: this.editandoId }
          }));
          window.dispatchEvent(new CustomEvent('datos-actualizados', {
            detail: { tipo: 'materia', accion: 'actualizada', id: this.editandoId }
          }));
          
          // No necesitamos cargar materias manualmente, el cache se actualiza automáticamente
        },
        error: (err) => {
          console.error('Error actualizando materia:', err);
          this.showError(err.message || this.errorMessages.GENERIC_ERROR);
          this.cargandoDatos = false;
        }
      });
    } else {
      const { nombre, codigo, horas_semanales, area, nivel } = this.formData;
      const nuevaMateria: any = { 
        nombre: nombre!, 
        codigo: codigo!,
        horas_semanales,
        area,
        nivel
      };
      
      // Primero crear la materia
      this.materiasService.addMateria(nuevaMateria).pipe(
        switchMap((materiaCreada: any) => {
          // Si hay docente seleccionado, crear la asignación
          if (this.docenteSeleccionado) {
            return this.materiasService.asignarDocente(
              materiaCreada.id, 
              this.docenteSeleccionado.id
            );
          }
          // Si no hay docente, retornar la materia creada
          return [materiaCreada];
        })
      ).subscribe({
        next: (response) => {
          this.showMessage(this.successMessages.SAVE_SUCCESS);
          this.resetForm();
          this.cargandoDatos = false;
          
          // Disparar eventos para actualizar informes
          window.dispatchEvent(new CustomEvent('materia-agregada', {
            detail: { materia: response }
          }));
          window.dispatchEvent(new CustomEvent('datos-actualizados', {
            detail: { tipo: 'materia', accion: 'agregada', data: response }
          }));
          // No necesitamos cargar materias manualmente, el cache se actualiza automáticamente
        },
        error: (err) => {
          this.showError(err.message || this.errorMessages.GENERIC_ERROR);
          this.cargandoDatos = false;
        }
      });
    }
  }

  editar(materia: Materia): void {
    this.abrirFormularioEdicion(materia);
  }

  confirmarEliminar(id: number): void {
    this.eliminarId = id;
    this.showEliminar = true;
  }

  eliminar(): void {
    if (this.eliminarId && !this.cargandoDatos) {
      const idAEliminar = this.eliminarId;
      this.cargandoDatos = true;
      
      this.materiasService.deleteMateria(idAEliminar).subscribe({
        next: () => {
          // Actualizar la lista localmente primero para respuesta inmediata
          this.materias = this.materias.filter(m => m.id !== idAEliminar);
          this.showMessage(this.successMessages.DELETE_SUCCESS);
          this.eliminarId = null;
          this.showEliminar = false;
          this.cargandoDatos = false;
          
          // Disparar evento personalizado para actualizar informes
          window.dispatchEvent(new CustomEvent('materia-eliminada', {
            detail: { materiaId: idAEliminar }
          }));
          
          // También disparar evento genérico de actualización de datos
          window.dispatchEvent(new CustomEvent('datos-actualizados', {
            detail: { tipo: 'materia', accion: 'eliminada', id: idAEliminar }
          }));
        },
        error: (err) => {
          this.showError(err.message || this.errorMessages.GENERIC_ERROR);
          this.eliminarId = null;
          this.showEliminar = false;
          this.cargandoDatos = false;
        }
      });
    } else {
      this.showEliminar = false;
    }
  }

  cancelarEliminar(): void {
    this.eliminarId = null;
    this.showEliminar = false;
  }

  resetForm(): void {
    this.formData = { nombre: '', codigo: '' };
    this.editandoId = null;
    this.alertError = '';
    this.docenteSeleccionado = null;
    this.busquedaDocente = '';
    this.mostrarListaDocentes = false;
    this.modoEdicion = false;
    this.mostrarFormulario = false;
  }

  private showMessage(msg: string): void {
    this.alertSuccess = msg;
    setTimeout(() => this.alertSuccess = '', this.timeouts.SUCCESS_MESSAGE_DURATION);
  }

  private showError(msg: string): void {
    this.alertError = msg;
    setTimeout(() => this.alertError = '', this.timeouts.ALERT_DURATION);
  }

  getNombreArea(codigo: string): string {
    const area = this.areasDisponibles.find(a => a.valor === codigo);
    return area ? area.nombre : codigo;
  }

  guardarManual(): void {
    console.log('=== CLICK EN GUARDAR MANUAL ===');
    console.log('Modo edición:', this.modoEdicion);
    console.log('Editando ID:', this.editandoId);
    console.log('Form data:', this.formData);
    this.guardar();
  }

  // ==================== GESTIÓN DE ÁREAS ====================
  
  cargarAreas(): void {
    const areasGuardadas = localStorage.getItem('profesort_areas');
    if (areasGuardadas) {
      this.areasDisponibles = JSON.parse(areasGuardadas);
    } else {
      // Áreas por defecto con colores de la paleta ProfeSort
      this.areasDisponibles = [
        { valor: 'EXACTAS', nombre: 'Ciencias Exactas', descripcion: 'Matemática, Física, Química', color: '#043237' },
        { valor: 'SOCIALES', nombre: 'Ciencias Sociales', descripcion: 'Historia, Geografía, Economía', color: '#0F8795' },
        { valor: 'NATURALES', nombre: 'Ciencias Naturales', descripcion: 'Biología, Ciencias de la Tierra', color: '#3abdcc' },
        { valor: 'HUMANIDADES', nombre: 'Humanidades', descripcion: 'Filosofía, Ética, Antropología', color: '#1a5f6f' },
        { valor: 'TECNOLOGIA', nombre: 'Tecnología', descripcion: 'Informática, Robótica, Programación', color: '#2c8c9e' },
        { valor: 'ARTES', nombre: 'Artes', descripcion: 'Música, Plástica, Teatro', color: '#45b8c9' },
        { valor: 'LENGUA', nombre: 'Lengua y Literatura', descripcion: 'Lengua, Literatura, Idiomas', color: '#0a4449' },
        { valor: 'EDUCACION_FISICA', nombre: 'Educación Física', descripcion: 'Deportes, Actividad Física', color: '#1b7a87' },
        { valor: 'SALUD', nombre: 'Ciencias de la Salud', descripcion: 'Salud, Primeros Auxilios', color: '#56cbd8' }
      ];
      this.guardarAreas();
    }
    this.agruparMateriasPorArea();
  }

  guardarAreas(): void {
    localStorage.setItem('profesort_areas', JSON.stringify(this.areasDisponibles));
  }

  agruparMateriasPorArea(): void {
    this.materiasPorArea = {};
    this.materias.forEach(materia => {
      const area = materia.area || 'SIN_AREA';
      if (!this.materiasPorArea[area]) {
        this.materiasPorArea[area] = [];
      }
      this.materiasPorArea[area].push(materia);
    });
  }

  abrirFormularioNuevaArea(): void {
    this.mostrarFormularioArea = true;
    this.modoEdicionArea = false;
    this.formDataArea = {
      valor: '',
      nombre: '',
      descripcion: '',
      color: '#043237'
    };
  }

  abrirFormularioEditarArea(area: Area): void {
    this.mostrarFormularioArea = true;
    this.modoEdicionArea = true;
    this.areaEditando = area;
    this.formDataArea = { ...area };
  }

  cerrarFormularioArea(): void {
    this.mostrarFormularioArea = false;
    this.modoEdicionArea = false;
    this.areaEditando = null;
    this.formDataArea = {
      valor: '',
      nombre: '',
      descripcion: '',
      color: '#667eea'
    };
  }

  guardarArea(): void {
    if (!this.formDataArea.valor?.trim() || !this.formDataArea.nombre?.trim()) {
      this.showError('El código y nombre del área son obligatorios');
      return;
    }

    const valorUpper = this.formDataArea.valor!.trim().toUpperCase().replace(/\s+/g, '_');

    if (this.modoEdicionArea && this.areaEditando) {
      // Editar área existente
      const index = this.areasDisponibles.findIndex(a => a.valor === this.areaEditando!.valor);
      if (index !== -1) {
        const valorAnterior = this.areaEditando.valor;
        this.areasDisponibles[index] = {
          valor: valorUpper,
          nombre: this.formDataArea.nombre!.trim(),
          descripcion: this.formDataArea.descripcion?.trim(),
          color: this.formDataArea.color || '#667eea'
        };

        // Actualizar materias que usan esta área
        if (valorAnterior !== valorUpper) {
          this.materias.forEach(materia => {
            if (materia.area === valorAnterior) {
              materia.area = valorUpper;
            }
          });
          // Guardar materias actualizadas en LocalStorage
          this.actualizarMateriasEnLocalStorage();
        }

        this.showMessage('Área actualizada correctamente');
      }
    } else {
      // Crear nueva área
      if (this.areasDisponibles.some(a => a.valor === valorUpper)) {
        this.showError('Ya existe un área con ese código');
        return;
      }

      this.areasDisponibles.push({
        valor: valorUpper,
        nombre: this.formDataArea.nombre!.trim(),
        descripcion: this.formDataArea.descripcion?.trim(),
        color: this.formDataArea.color || '#667eea'
      });

      this.showMessage('Área creada correctamente');
    }

    this.guardarAreas();
    this.cerrarFormularioArea();
    this.agruparMateriasPorArea();
  }

  confirmarEliminarArea(valor: string): void {
    this.areaEliminarValor = valor;
    this.showEliminarArea = true;
  }

  eliminarArea(): void {
    if (!this.areaEliminarValor) return;

    // Verificar si hay materias usando esta área
    const materiasConArea = this.materias.filter(m => m.area === this.areaEliminarValor);
    if (materiasConArea.length > 0) {
      this.showError(`No se puede eliminar. Hay ${materiasConArea.length} materia(s) asignada(s) a esta área`);
      this.showEliminarArea = false;
      this.areaEliminarValor = '';
      return;
    }

    this.areasDisponibles = this.areasDisponibles.filter(a => a.valor !== this.areaEliminarValor);
    this.guardarAreas();
    this.showMessage('Área eliminada correctamente');
    this.showEliminarArea = false;
    this.areaEliminarValor = '';
    this.agruparMateriasPorArea();
  }

  cancelarEliminarArea(): void {
    this.showEliminarArea = false;
    this.areaEliminarValor = '';
  }

  actualizarMateriasEnLocalStorage(): void {
    const materiasLocal = localStorage.getItem('profesort_materias');
    if (materiasLocal) {
      const materias = JSON.parse(materiasLocal);
      localStorage.setItem('profesort_materias', JSON.stringify(materias));
      this.cargarMaterias(); // Recargar para sincronizar
    }
  }

  cambiarAreaMateria(materiaId: number, nuevaArea: string): void {
    const materia = this.materias.find(m => m.id === materiaId);
    if (!materia) return;

    const materiaActualizada = { ...materia, area: nuevaArea };
    
    this.materiasService.updateMateria(materiaId, materiaActualizada).subscribe({
      next: () => {
        materia.area = nuevaArea;
        this.agruparMateriasPorArea();
        this.showMessage('Área de la materia actualizada');
        
        // Disparar eventos para actualizar informes
        window.dispatchEvent(new CustomEvent('materia-actualizada', {
          detail: { materiaId: materiaId, nuevaArea: nuevaArea }
        }));
        window.dispatchEvent(new CustomEvent('datos-actualizados', {
          detail: { tipo: 'materia', accion: 'area-actualizada', id: materiaId }
        }));
      },
      error: (err) => {
        this.showError('Error al actualizar el área de la materia');
      }
    });
  }

  getMateriasDeArea(valorArea: string): Materia[] {
    return this.materiasPorArea[valorArea] || [];
  }

  getColorArea(valor: string): string {
    const area = this.areasDisponibles.find(a => a.valor === valor);
    return area?.color || '#667eea';
  }

  debugFormState(form: any): void {
    console.log('Estado del formulario:');
    console.log('- Valid:', form.valid);
    console.log('- Invalid:', form.invalid);
    console.log('- Errors:', form.errors);
    console.log('- Form values:', form.value);
    console.log('- Controles:');
    
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      console.log(`  ${key}:`, {
        value: control.value,
        valid: control.valid,
        errors: control.errors
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
