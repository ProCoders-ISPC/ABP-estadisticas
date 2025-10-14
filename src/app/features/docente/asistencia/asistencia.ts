import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, EstudianteAsistencia, AsistenciaRegistro } from '../../../core/services/asistencia.service';
import { MateriasService, Materia } from '../../../core/services/materias.service';
import { EstudiantesService, Estudiante } from '../../../core/services/estudiantes.service';
import { AuthService } from '../../../core/services/services';

@Component({
  selector: 'app-asistencia-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html',
  styleUrls: ['./asistencia.css']
})
export class AsistenciaDocenteComponent implements OnInit {
  materias: Materia[] = [];
  estudiantes: EstudianteAsistencia[] = [];
  materiaSeleccionada: Materia | null = null;
  fechaSeleccionada: string = '';
  fechaHoy: string = '';
  
  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';
  
  docenteId: number = 0;

  // Nuevas propiedades para edición
  modoEdicion = false;
  asistenciaSeleccionada: AsistenciaRegistro | null = null;
  mostrarModalEditar = false;

  constructor(
    private asistenciaService: AsistenciaService,
    private materiasService: MateriasService,
    private estudiantesService: EstudiantesService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.fechaHoy = today.toISOString().split('T')[0];
    this.fechaSeleccionada = this.fechaHoy;
  }

  ngOnInit(): void {
    this.cargarMaterias();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.docenteId = user.id;
    }
  }

  cargarMaterias(): void {
    this.cargando = true;
    this.materiasService.getMaterias().subscribe({
      next: (data) => {
        // Filtrar solo las materias del docente actual
        this.materias = data.filter(materia => 
          materia.docenteId === this.docenteId
        );
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar materias:', err);
        this.error = 'Error al cargar las materias del docente';
        this.cargando = false;
      }
    });
  }

  cargarEstudiantes(): void {
    if (!this.materiaSeleccionada || !this.fechaSeleccionada) {
      this.estudiantes = [];
      return;
    }

    this.cargando = true;
    this.error = '';

    // Cargar estudiantes de la materia
    this.estudiantesService.getEstudiantes().subscribe({
      next: (estudiantes: Estudiante[]) => {
        // Mapear estudiantes con información de asistencia
        this.estudiantes = estudiantes.map((est: Estudiante) => ({
          id: est.id,
          nombre: `${est.nombre} ${est.apellidos || ''}`,
          legajo: est.legajo || est.id.toString(),
          estado: undefined,
          asistenciaId: undefined
        }));

        // Cargar asistencias existentes para esta fecha
        this.cargarAsistenciasExistentes();
      },
      error: (err: any) => {
        console.error('Error al cargar estudiantes:', err);
        this.error = 'Error al cargar estudiantes de la materia';
        this.cargando = false;
      }
    });
  }

  cargarAsistenciasExistentes(): void {
    if (!this.materiaSeleccionada || !this.fechaSeleccionada) return;

    this.asistenciaService.getAsistenciasByMateria(this.materiaSeleccionada.id).subscribe({
      next: (asistencias) => {
        // Filtrar asistencias de la fecha seleccionada
        const asistenciasFecha = asistencias.filter(a => a.fecha === this.fechaSeleccionada);
        
        // Actualizar estado de estudiantes con asistencias existentes
        this.estudiantes.forEach(estudiante => {
          const asistencia = asistenciasFecha.find(a => a.id_estudiante === estudiante.id);
          if (asistencia) {
            estudiante.estado = asistencia.estado;
            estudiante.asistenciaId = asistencia.id;
          }
        });
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar asistencias:', err);
        this.cargando = false;
      }
    });
  }

  marcarEstado(estudiante: EstudianteAsistencia, estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'): void {
    estudiante.estado = estado;
    this.limpiarMensajes();
  }

  marcarTodosPresentes(): void {
    this.estudiantes.forEach(est => est.estado = 'PRESENTE');
    this.limpiarMensajes();
  }

  marcarTodosAusentes(): void {
    this.estudiantes.forEach(est => est.estado = 'AUSENTE');
    this.limpiarMensajes();
  }

  contarEstado(estado: string): number {
    return this.estudiantes.filter(est => est.estado === estado).length;
  }

  calcularPorcentaje(): number {
    const total = this.estudiantes.length;
    if (total === 0) return 0;
    const presentes = this.contarEstado('PRESENTE') + this.contarEstado('TARDANZA');
    return Math.round((presentes / total) * 100);
  }

  getEstadoTexto(estado?: string): string {
    switch(estado) {
      case 'PRESENTE': return 'Presente';
      case 'AUSENTE': return 'Ausente';
      case 'TARDANZA': return 'Tardanza';
      default: return 'Sin registrar';
    }
  }

  hayEstudiantesConEstado(): boolean {
    return this.estudiantes.some(est => est.estado !== undefined);
  }

  limpiarMensajes(): void {
    this.error = '';
    this.mensaje = '';
  }

  guardarAsistencia(): void {
    if (!this.materiaSeleccionada || !this.fechaSeleccionada) {
      this.error = 'Seleccione materia y fecha';
      return;
    }

    const sinEstado = this.estudiantes.filter(est => !est.estado);
    if (sinEstado.length > 0) {
      this.error = `Hay ${sinEstado.length} estudiantes sin estado de asistencia`;
      return;
    }

    this.guardando = true;
    this.limpiarMensajes();

    // Crear registros de asistencia
    const asistencias = this.estudiantes.map(est => ({
      id_estudiante: est.id,
      id_materia: this.materiaSeleccionada!.id,
      id_docente: this.docenteId,
      fecha: this.fechaSeleccionada,
      estado: est.estado!,
      observaciones: est.estado === 'AUSENTE' ? 'Sin justificación' : undefined
    }));

    this.asistenciaService.registrarAsistenciaLote(asistencias).subscribe({
      next: () => {
        this.mensaje = '✓ Asistencia guardada exitosamente';
        this.guardando = false;
        setTimeout(() => {
          this.mensaje = '';
          this.cargarEstudiantes(); // Recargar para actualizar IDs
        }, 3000);
      },
      error: (err) => {
        console.error('Error al guardar asistencia:', err);
        this.error = 'Error al guardar la asistencia. Intente nuevamente.';
        this.guardando = false;
      }
    });
  }

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
        this.cargarEstudiantes(); // Recargar lista
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
        this.cargarEstudiantes();
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
}