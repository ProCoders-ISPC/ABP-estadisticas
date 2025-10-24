import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursosService, Curso } from 'src/app/core/services/cursos.service';
import { EstudiantesService, Estudiante } from 'src/app/core/services/estudiantes.service';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-cursos.html',
  styleUrls: ['./admin-cursos.css']
})
export class AdminCursosComponent implements OnInit {
  cursos: Curso[] = [];
  estudiantesPorCurso: { [cursoId: number]: Estudiante[] } = {};
  cursoAbierto: number | null = null;

  // Formulario para nuevo curso
  nuevoCurso: Omit<Curso, 'id' | 'cantEstudiantes' | 'estudiantes' | 'activo'> = {
    nombre: '',
    anio: 1,
    division: '',
    turno: 'MAÑANA'
  };

  constructor(
    private cursosService: CursosService,
    private estudiantesService: EstudiantesService
  ) { }

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.cursosService.getCursos().subscribe(cursos => {
      this.cursos = cursos;
    });
  }

  toggleCurso(cursoId: number): void {
    if (this.cursoAbierto === cursoId) {
      this.cursoAbierto = null;
    } else {
      this.cursoAbierto = cursoId;
      this.cargarEstudiantesPorCurso(cursoId);
    }
  }

  cargarEstudiantesPorCurso(cursoId: number): void {
    if (!this.estudiantesPorCurso[cursoId]) {
      this.estudiantesService.getEstudiantes().subscribe(estudiantes => {
        this.estudiantesPorCurso[cursoId] = estudiantes.filter(e => e.cursoId === cursoId);
      });
    }
  }

  crearCurso(): void {
    if (this.nuevoCurso.nombre && this.nuevoCurso.division) {
      this.cursosService.addCurso(this.nuevoCurso).subscribe(curso => {
        this.cursos.push(curso);
        this.nuevoCurso = { nombre: '', anio: 1, division: '', turno: 'MAÑANA' };
      });
    }
  }
}
