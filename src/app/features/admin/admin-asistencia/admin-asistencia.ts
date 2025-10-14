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
    // Simular carga de asistencias desde LocalStorage
    setTimeout(() => {
      // Aquí cargaríamos desde el servicio real
      this.asistencias = this.generarDatosDemostracion();
      this.aplicarFiltros();
      this.cargando = false;
    }, 1000);
  }

  generarDatosDemostracion(): AsistenciaRegistro[] {
    return [
      {
        id: 1,
        estudianteId: 1,
        estudianteNombre: 'Juan Pérez',
        materiaId: 1,
        materiaNombre: 'Matemáticas',
        fecha: '2024-10-14',
        estado: 'PRESENTE',
        observaciones: ''
      },
      {
        id: 2,
        estudianteId: 2,
        estudianteNombre: 'María González',
        materiaId: 1,
        materiaNombre: 'Matemáticas',
        fecha: '2024-10-14',
        estado: 'AUSENTE',
        observaciones: 'Sin justificación'
      },
      {
        id: 3,
        estudianteId: 3,
        estudianteNombre: 'Carlos López',
        materiaId: 2,
        materiaNombre: 'Historia',
        fecha: '2024-10-14',
        estado: 'TARDANZA',
        observaciones: 'Llegó 15 minutos tarde'
      }
    ];
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
    
    const header = 'Estudiante,Materia,Fecha,Estado\n';
    const csvContent = header + csv;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}