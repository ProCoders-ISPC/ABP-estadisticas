import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Curso {
  id: number;
  nombre: string;
  anio: number;
  division: string;
  turno: 'MAÑANA' | 'TARDE' | 'NOCHE';
  cantEstudiantes?: number;
  estudiantes?: number[];
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private cursosCache$ = new BehaviorSubject<Curso[]>([]);
  private cursosLoaded = false;

  constructor() { 
    this.initializeCursos();
  }

  private initializeCursos(): void {
    const cursos = this.getCursosFromStorage();
    if (cursos.length === 0) {
      this.generateDemoCursos();
    }
  }

  private getCursosFromStorage(): Curso[] {
    try {
      return JSON.parse(localStorage.getItem('profesort_cursos') || '[]');
    } catch {
      return [];
    }
  }

  private saveCursosToStorage(cursos: Curso[]): void {
    localStorage.setItem('profesort_cursos', JSON.stringify(cursos));
  }

  private generateDemoCursos(): void {
    const cursosDemo: Curso[] = [
      {
        id: 1,
        nombre: '1° Año A',
        anio: 1,
        division: 'A',
        turno: 'MAÑANA',
        estudiantes: [1, 2, 3, 4, 5, 6, 7, 8],
        cantEstudiantes: 8,
        activo: true
      },
      {
        id: 2,
        nombre: '1° Año B',
        anio: 1,
        division: 'B',
        turno: 'TARDE',
        estudiantes: [9, 10, 11, 12, 13, 14, 15, 16],
        cantEstudiantes: 8,
        activo: true
      },
      {
        id: 3,
        nombre: '2° Año A',
        anio: 2,
        division: 'A',
        turno: 'MAÑANA',
        estudiantes: [17, 18, 19, 20, 21, 22, 23, 24],
        cantEstudiantes: 8,
        activo: true
      },
      {
        id: 4,
        nombre: '2° Año B',
        anio: 2,
        division: 'B',
        turno: 'NOCHE',
        estudiantes: [25, 26, 27, 28, 29, 30],
        cantEstudiantes: 6,
        activo: true
      }
    ];
    
    this.saveCursosToStorage(cursosDemo);
    this.cursosCache$.next(cursosDemo);
    this.cursosLoaded = true;
    console.log('📚 Cursos demo generados:', cursosDemo.length);
  }

  getCursos(): Observable<Curso[]> {
    if (this.cursosLoaded) {
      return this.cursosCache$.asObservable();
    }

    const cursos = this.getCursosFromStorage();
    this.cursosCache$.next(cursos);
    this.cursosLoaded = true;
    console.log('📚 Cursos cargados:', cursos.length);
    return this.cursosCache$.asObservable();
  }

  getCursoById(id: number): Observable<Curso | null> {
    const cursos = this.getCursosFromStorage();
    const curso = cursos.find(c => c.id === id) || null;
    return of(curso);
  }

  addCurso(curso: Omit<Curso, 'id' | 'cantEstudiantes' | 'estudiantes' | 'activo'>): Observable<Curso> {
    const cursos = this.getCursosFromStorage();
    const nuevoCurso: Curso = {
      ...curso,
      id: cursos.length > 0 ? Math.max(...cursos.map(c => c.id)) + 1 : 1,
      cantEstudiantes: 0,
      estudiantes: [],
      activo: true
    };
    
    cursos.push(nuevoCurso);
    this.saveCursosToStorage(cursos);
    this.cursosCache$.next(cursos);
    console.log('📚 Curso creado:', nuevoCurso.nombre);
    return of(nuevoCurso);
  }

  updateCurso(id: number, datos: Partial<Curso>): Observable<Curso | null> {
    const cursos = this.getCursosFromStorage();
    const index = cursos.findIndex(c => c.id === id);
    
    if (index === -1) {
      return of(null);
    }

    cursos[index] = { ...cursos[index], ...datos };
    this.saveCursosToStorage(cursos);
    this.cursosCache$.next(cursos);
    console.log('📚 Curso actualizado:', cursos[index].nombre);
    return of(cursos[index]);
  }

  deleteCurso(id: number): Observable<boolean> {
    const cursos = this.getCursosFromStorage();
    const index = cursos.findIndex(c => c.id === id);
    
    if (index === -1) {
      return of(false);
    }

    const cursoEliminado = cursos.splice(index, 1)[0];
    this.saveCursosToStorage(cursos);
    this.cursosCache$.next(cursos);
    console.log('📚 Curso eliminado:', cursoEliminado.nombre);
    return of(true);
  }

  asignarEstudianteACurso(estudianteId: number, cursoId: number): Observable<boolean> {
    const cursos = this.getCursosFromStorage();
    const curso = cursos.find(c => c.id === cursoId);
    
    if (!curso) {
      return of(false);
    }

    // Remover estudiante de otros cursos
    cursos.forEach(c => {
      if (c.estudiantes) {
        c.estudiantes = c.estudiantes.filter(id => id !== estudianteId);
        c.cantEstudiantes = c.estudiantes.length;
      }
    });

    // Agregar al nuevo curso
    if (!curso.estudiantes) {
      curso.estudiantes = [];
    }
    
    if (!curso.estudiantes.includes(estudianteId)) {
      curso.estudiantes.push(estudianteId);
      curso.cantEstudiantes = curso.estudiantes.length;
    }

    this.saveCursosToStorage(cursos);
    this.cursosCache$.next(cursos);
    console.log('📚 Estudiante asignado al curso:', curso.nombre);
    return of(true);
  }

  desasignarEstudianteDeCurso(estudianteId: number): Observable<boolean> {
    const cursos = this.getCursosFromStorage();
    let cambios = false;

    cursos.forEach(curso => {
      if (curso.estudiantes && curso.estudiantes.includes(estudianteId)) {
        curso.estudiantes = curso.estudiantes.filter(id => id !== estudianteId);
        curso.cantEstudiantes = curso.estudiantes.length;
        cambios = true;
      }
    });

    if (cambios) {
      this.saveCursosToStorage(cursos);
      this.cursosCache$.next(cursos);
      console.log('📚 Estudiante desasignado de curso');
    }

    return of(cambios);
  }

  getEstudiantesPorCurso(cursoId: number): Observable<number[]> {
    const cursos = this.getCursosFromStorage();
    const curso = cursos.find(c => c.id === cursoId);
    return of(curso?.estudiantes || []);
  }

  refreshCursos(): Observable<Curso[]> {
    this.cursosLoaded = false;
    return this.getCursos();
  }
}
