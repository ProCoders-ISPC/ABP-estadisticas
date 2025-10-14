import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Materia, DocenteSimple } from './materias.service';

@Injectable({
  providedIn: 'root'
})
export class MateriasLocalService {
  
  constructor(private localStorageService: LocalStorageService) {}

  getMaterias(): Observable<Materia[]> {
    return new Observable(observer => {
      const materias = this.localStorageService.getMaterias();
      observer.next(materias);
      observer.complete();
    });
  }

  getMateriasByDocente(docenteId: number): Observable<Materia[]> {
    return new Observable(observer => {
      const materias = this.localStorageService.getMaterias();
      const materiasDocente = materias.filter(m => m.docenteId === docenteId);
      observer.next(materiasDocente);
      observer.complete();
    });
  }

  addMateria(materia: Omit<Materia, 'id'>): Observable<Materia> {
    return new Observable(observer => {
      const nuevaMateria = this.localStorageService.addMateria(materia as any);
      observer.next(nuevaMateria);
      observer.complete();
    });
  }

  updateMateria(id: number, materia: Partial<Materia>): Observable<Materia> {
    return new Observable(observer => {
  // Crear una copia sin las propiedades relacionadas al docente (se manejan por asignaciones)
  // Evitamos pasar campos que pueden ser null (docenteDni/docenteEmail) al LocalStorageService
  const { docenteId, docenteNombre, docenteLegajo, docenteDni, docenteEmail, ...materiaData } = materia;
      const success = this.localStorageService.updateMateria(id, materiaData);
      if (success) {
        const materiaActualizada = this.localStorageService.getMateriaById(id);
        observer.next(materiaActualizada!);
        observer.complete();
      } else {
        observer.error(new Error('Materia no encontrada'));
      }
    });
  }

  deleteMateria(id: number): Observable<void> {
    return new Observable(observer => {
      const success = this.localStorageService.deleteMateria(id);
      if (success) {
        observer.next();
        observer.complete();
      } else {
        observer.error(new Error('Materia no encontrada'));
      }
    });
  }

  asignarDocente(materiaId: number, docenteId: number | null): Observable<any> {
    return new Observable(observer => {
      this.localStorageService.updateAsignacion(materiaId, docenteId);
      observer.next({ success: true });
      observer.complete();
    });
  }

  getDocentes(): Observable<DocenteSimple[]> {
    return new Observable(observer => {
      const usuarios = this.localStorageService.getUsuarios();
      const docentes = usuarios
        .filter(u => u.id_rol === 2)
        .map(u => ({
          id: u.id,
          id_usuario: u.id,
          name: u.name,
          legajo: u.legajo,
          dni: u.dni,
          email: u.email,
          area: u.area
        }));
      observer.next(docentes);
      observer.complete();
    });
  }
}
