
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstudiantesService, Estudiante } from 'src/app/core/services/estudiantes.service';

@Component({
  selector: 'app-estudiantes',
  templateUrl: './estudiantes.html',
  styleUrls: ['./estudiantes.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule]
})
export class EstudiantesComponent implements OnInit {
  estudianteForm!: FormGroup;
  modalForm!: FormGroup;
  estudiantes: Estudiante[] = [];
  estudiantesFiltrados: Estudiante[] = [];
  editandoEstudiante: Estudiante | null = null;
  estudianteSeleccionado: Estudiante | null = null;
  modalTitle: string = '';
  modalEditMode: boolean = false;
  
  // Modal de vista detallada
  mostrarModalInfo = false;
  estudianteInfo: Estudiante | null = null;
  
  cargando = false;
  error = '';
  mensaje = '';
  busquedaTerm = '';

  constructor(private fb: FormBuilder, private estudiantesService: EstudiantesService) { }

  ngOnInit(): void {
    this.estudianteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      legajo: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      domicilio: [''],
      fecha_nacimiento: ['']
    });

    this.modalForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      legajo: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      domicilio: [''],
      fecha_nacimiento: ['']
    });

    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    this.error = '';
    
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data: Estudiante[]) => {
        this.estudiantes = data;
        this.estudiantesFiltrados = [...this.estudiantes];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar estudiantes:', err);
        this.error = 'Error al cargar los estudiantes';
        this.cargando = false;
      }
    });
  }
  buscarEstudiantes(termino: string): void {
    const t = termino.trim().toLowerCase();
    if (!t) {
      this.estudiantesFiltrados = [...this.estudiantes];
      return;
    }
    this.estudiantesFiltrados = this.estudiantes.filter(e =>
      (e.nombre.toLowerCase().includes(t) ||
        e.legajo.toLowerCase().includes(t) ||
        e.email.toLowerCase().includes(t))
    );
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.buscarEstudiantes(target.value);
  }

  onSubmit(): void {
    if (this.estudianteForm.valid) {
      this.cargando = true;
      
      if (this.editandoEstudiante) {
        // Actualizar estudiante existente
        const datosActualizados = {
          ...this.editandoEstudiante,
          ...this.estudianteForm.value
        };
        
        this.estudiantesService.actualizarEstudiante(this.editandoEstudiante.id, datosActualizados).subscribe({
          next: () => {
            this.mensaje = '✓ Estudiante actualizado exitosamente';
            this.cargarEstudiantes();
            this.cancelarEdicion();
            this.cerrarModal();
            setTimeout(() => this.mensaje = '', 3000);
          },
          error: (err) => {
            console.error('Error al actualizar estudiante:', err);
            this.error = 'Error al actualizar el estudiante';
            this.cargando = false;
          }
        });
      } else {
        // Crear nuevo estudiante
        const nuevoEstudiante = this.estudianteForm.value;
        
        this.estudiantesService.crearEstudiante(nuevoEstudiante).subscribe({
          next: () => {
            this.mensaje = '✓ Estudiante creado exitosamente';
            this.cargarEstudiantes();
            this.estudianteForm.reset();
            this.cerrarModal();
            setTimeout(() => this.mensaje = '', 3000);
          },
          error: (err) => {
            console.error('Error al crear estudiante:', err);
            this.error = 'Error al crear el estudiante';
            this.cargando = false;
          }
        });
      }
    } else {
      this.estudianteForm.markAllAsTouched();
    }
  }

  cerrarModal(): void {
    const modal = document.getElementById('estudianteModal');
    if (modal) {
      const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  cancelarEdicion(): void {
    this.editandoEstudiante = null;
    this.estudianteForm.reset();
  }

  verFicha(estudiante: Estudiante): void {
    this.estudianteSeleccionado = estudiante;
    this.modalTitle = 'Ficha del Estudiante';
    this.modalEditMode = false;
  }

  editarEstudiante(estudiante: Estudiante): void {
    this.estudianteSeleccionado = estudiante;
    this.editandoEstudiante = estudiante;
    this.modalTitle = 'Editar Estudiante';
    this.modalEditMode = true;
    this.estudianteForm.setValue({
      nombre: estudiante.nombre,
      legajo: estudiante.legajo,
      email: estudiante.email,
      estado: estudiante.estado
    });
  }

  guardarCambiosModal(): void {
    if (this.modalForm.valid && this.estudianteSeleccionado) {
      const index = this.estudiantes.findIndex(e => e.id === this.estudianteSeleccionado?.id);
      if (index !== -1) {
        this.estudiantes[index] = { ...this.estudianteSeleccionado, ...this.modalForm.value };
      }
      this.modalForm.reset();
      this.estudianteSeleccionado = null;
      this.modalEditMode = false;
    }
  }

  eliminarEstudiante(estudiante: Estudiante): void {
    if (confirm(`¿Está seguro que desea eliminar al estudiante ${estudiante.nombre} ${estudiante.apellidos}?`)) {
      this.cargando = true;
      
      this.estudiantesService.eliminarEstudiante(estudiante.id).subscribe({
        next: () => {
          this.mensaje = '✓ Estudiante eliminado exitosamente';
          this.cargarEstudiantes();
          setTimeout(() => this.mensaje = '', 3000);
        },
        error: (err) => {
          console.error('Error al eliminar estudiante:', err);
          this.error = 'Error al eliminar el estudiante';
          this.cargando = false;
        }
      });
    }
  }

  abrirModalNuevo(): void {
    this.modalTitle = 'Nuevo Estudiante';
    this.modalEditMode = true;
    this.editandoEstudiante = null;
    this.estudianteForm.reset();
  }

  abrirModalEditar(estudiante: Estudiante): void {
    this.modalTitle = 'Editar Estudiante';
    this.modalEditMode = true;
    this.editandoEstudiante = estudiante;
    
    this.estudianteForm.patchValue({
      nombre: estudiante.nombre,
      apellidos: estudiante.apellidos,
      legajo: estudiante.legajo,
      dni: estudiante.dni,
      email: estudiante.email,
      telefono: '',
      domicilio: '',
      fecha_nacimiento: ''
    });
  }

  // Modal de información detallada
  verInfoEstudiante(estudiante: Estudiante): void {
    this.estudianteInfo = estudiante;
    this.mostrarModalInfo = true;
  }

  cerrarModalInfo(): void {
    this.mostrarModalInfo = false;
    this.estudianteInfo = null;
  }
}
