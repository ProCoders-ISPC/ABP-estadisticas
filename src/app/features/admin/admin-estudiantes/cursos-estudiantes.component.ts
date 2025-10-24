import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Curso {
  id: number;
  nombre: string;
  anio: number;
  division: string;
  turno: 'MAÑANA' | 'TARDE' | 'NOCHE';
  estudiantes?: number[];
}

export interface Estudiante {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cursoId?: number;
  activo: boolean;
}

@Component({
  selector: 'app-cursos-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cursos-estudiantes.component.html',
  styleUrls: ['./cursos-estudiantes.component.css']
})
export class CursosEstudiantesComponent implements OnInit {
  cursos: Curso[] = [];
  estudiantes: Estudiante[] = [];
  estudiantesPorCurso: { [cursoId: number]: Estudiante[] } = {};
  cursoAbierto: number | null = null;

  // Formulario para nuevo curso
  nuevoCurso = {
    nombre: '',
    anio: 1,
    division: '',
    turno: 'MAÑANA' as 'MAÑANA' | 'TARDE' | 'NOCHE'
  };

  constructor() { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Generar cursos demo
    this.cursos = [
      {
        id: 1,
        nombre: '1° Año A',
        anio: 1,
        division: 'A',
        turno: 'MAÑANA',
        estudiantes: [1, 2, 3, 4, 5, 6, 7, 8]
      },
      {
        id: 2,
        nombre: '1° Año B',
        anio: 1,
        division: 'B',
        turno: 'TARDE',
        estudiantes: [9, 10, 11, 12, 13, 14, 15, 16]
      },
      {
        id: 3,
        nombre: '2° Año A',
        anio: 2,
        division: 'A',
        turno: 'MAÑANA',
        estudiantes: [17, 18, 19, 20, 21, 22, 23, 24]
      },
      {
        id: 4,
        nombre: '2° Año B',
        anio: 2,
        division: 'B',
        turno: 'NOCHE',
        estudiantes: [25, 26, 27, 28, 29, 30]
      }
    ];

    // Generar estudiantes demo
    this.estudiantes = this.generarEstudiantesDemo();
    
    // Organizar estudiantes por curso
    this.organizarEstudiantesPorCurso();
  }

  generarEstudiantesDemo(): Estudiante[] {
    const nombres = ['Ana', 'Carlos', 'María', 'Juan', 'Laura', 'Pedro', 'Sofía', 'Miguel', 'Carmen', 'Diego', 'Valentina', 'Andrés', 'Lucía', 'Gabriel', 'Camila', 'Roberto', 'Isabella', 'Mateo', 'Valeria', 'Santiago', 'Natalia', 'Sebastián', 'Daniela', 'Fernando', 'Alejandra', 'Nicolás', 'Paola', 'Emilio', 'Mariana', 'Ricardo'];
    
    const apellidos = ['González', 'Rodríguez', 'García', 'López', 'Martínez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Jiménez', 'Herrera', 'Medina', 'Castro', 'Ortega', 'Ruiz', 'Vargas', 'Ramos', 'Cruz', 'Mendoza', 'Aguilar', 'Silva', 'Guerrero', 'Muñoz', 'Rojas'];

    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      dni: `${20000000 + i}`,
      nombre: nombres[i],
      apellido: apellidos[i],
      email: `${nombres[i].toLowerCase()}.${apellidos[i].toLowerCase()}@email.com`,
      telefono: `11${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      cursoId: this.obtenerCursoParaEstudiante(i + 1),
      activo: Math.random() > 0.1 // 90% activos
    }));
  }

  obtenerCursoParaEstudiante(estudianteId: number): number {
    if (estudianteId <= 8) return 1;
    if (estudianteId <= 16) return 2;
    if (estudianteId <= 24) return 3;
    return 4;
  }

  organizarEstudiantesPorCurso(): void {
    this.estudiantesPorCurso = {};
    this.cursos.forEach(curso => {
      this.estudiantesPorCurso[curso.id] = this.estudiantes.filter(e => e.cursoId === curso.id);
    });
    
    // Estudiantes sin curso asignado
    const estudiantesSinCurso = this.estudiantes.filter(e => !e.cursoId);
    if (estudiantesSinCurso.length > 0) {
      this.estudiantesPorCurso[0] = estudiantesSinCurso;
    }
  }

  toggleCurso(cursoId: number): void {
    this.cursoAbierto = this.cursoAbierto === cursoId ? null : cursoId;
  }

  crearCurso(): void {
    if (this.nuevoCurso.nombre && this.nuevoCurso.division) {
      const nuevoCurso: Curso = {
        id: Math.max(...this.cursos.map(c => c.id)) + 1,
        nombre: this.nuevoCurso.nombre,
        anio: this.nuevoCurso.anio,
        division: this.nuevoCurso.division,
        turno: this.nuevoCurso.turno,
        estudiantes: []
      };
      
      this.cursos.push(nuevoCurso);
      this.estudiantesPorCurso[nuevoCurso.id] = [];
      this.nuevoCurso = { nombre: '', anio: 1, division: '', turno: 'MAÑANA' };
    }
  }

  eliminarCurso(cursoId: number): void {
    if (confirm('¿Está seguro de eliminar este curso? Los estudiantes quedarán sin asignar.')) {
      // Desasignar estudiantes del curso
      this.estudiantes = this.estudiantes.map(e => 
        e.cursoId === cursoId ? { ...e, cursoId: undefined } : e
      );
      
      // Eliminar curso
      this.cursos = this.cursos.filter(c => c.id !== cursoId);
      delete this.estudiantesPorCurso[cursoId];
      
      if (this.cursoAbierto === cursoId) {
        this.cursoAbierto = null;
      }
      
      this.organizarEstudiantesPorCurso();
    }
  }

  asignarEstudianteACurso(estudianteId: number, cursoId: number): void {
    const estudiante = this.estudiantes.find(e => e.id === estudianteId);
    if (estudiante) {
      estudiante.cursoId = cursoId;
      this.organizarEstudiantesPorCurso();
    }
  }

  desasignarEstudianteDeCurso(estudianteId: number): void {
    const estudiante = this.estudiantes.find(e => e.id === estudianteId);
    if (estudiante) {
      estudiante.cursoId = undefined;
      this.organizarEstudiantesPorCurso();
    }
  }

  getTotalEstudiantesPorCurso(cursoId: number): number {
    return this.estudiantesPorCurso[cursoId]?.length || 0;
  }

  getEstudiantesActivosPorCurso(cursoId: number): number {
    return this.estudiantesPorCurso[cursoId]?.filter(e => e.activo).length || 0;
  }

  getTotalEstudiantesActivos(): number {
    return this.estudiantes.filter(e => e.activo).length;
  }

  onAsignarCurso(event: Event, estudianteId: number): void {
    const target = event.target as HTMLSelectElement;
    const cursoId = +target.value;
    if (cursoId) {
      this.asignarEstudianteACurso(estudianteId, cursoId);
      target.value = ''; // Reset select
    }
  }
}