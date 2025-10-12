import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { DocenteCarga } from './admindocente.service';

@Injectable({
  providedIn: 'root'
})
export class AdminDocenteLocalService {
  
  readonly ROL_ADMIN = 1;
  readonly ROL_DOCENTE = 2;
  readonly ROL_USUARIO = 3;

  constructor(private localStorageService: LocalStorageService) {}

  getDocentesCarga(
    termino?: string,
    estado?: string,
    area?: string,
    page: number = 1,
    limit: number = 10
  ): Observable<DocenteCarga[]> {
    return new Observable(observer => {
      let docentes = this.localStorageService.getUsuarios()
        .filter(u => u.id_rol === this.ROL_DOCENTE);

      // Filtrar por término de búsqueda
      if (termino) {
        const terminoLower = termino.toLowerCase();
        docentes = docentes.filter(d =>
          d.name.toLowerCase().includes(terminoLower) ||
          d.email.toLowerCase().includes(terminoLower) ||
          d.legajo.toLowerCase().includes(terminoLower) ||
          d.dni.includes(terminoLower)
        );
      }

      // Filtrar por estado
      if (estado) {
        const estadoActivo = estado === 'Activo';
        docentes = docentes.filter(d => d.is_active === estadoActivo);
      }

      // Filtrar por área
      if (area) {
        docentes = docentes.filter(d => d.area === area);
      }

      // Obtener materias y asignaciones para calcular estadísticas
      const materias = this.localStorageService.getMaterias();
      const asignaciones = this.localStorageService.getAsignaciones();

      const docentesCarga: DocenteCarga[] = docentes.map(docente => {
        // Contar materias asignadas
        const asignacionesDocente = asignaciones.filter(
          a => a.id_usuario === docente.id && a.estado === 'ACTIVO'
        );

        // Obtener nombres de materias
        const materiasDocente = asignacionesDocente.map(asig => {
          const materia = materias.find(m => m.id === asig.id_materia);
          return materia ? materia.nombre : null;
        }).filter(nombre => nombre !== null) as string[];

        return {
          id: docente.id,
          id_usuario: docente.id,
          name: docente.name,
          email: docente.email,
          legajo: docente.legajo,
          dni: docente.dni,
          fecha_nacimiento: docente.fecha_nacimiento,
          domicilio: docente.domicilio,
          telefono: docente.telefono,
          id_rol: docente.id_rol,
          area: docente.area,
          fecha_ingreso: docente.fecha_ingreso,
          is_active: docente.is_active,
          created_at: docente.created_at,
          estado: docente.is_active ? 'Activo' : 'Inactivo',
          cantidadMaterias: asignacionesDocente.length,
          cantidadEstudiantes: 0, // Por ahora sin estudiantes
          materias: materiasDocente
        };
      });

      observer.next(docentesCarga);
      observer.complete();
    });
  }

  getDocenteCarga(id: number): Observable<DocenteCarga> {
    return new Observable(observer => {
      const docente = this.localStorageService.getUsuarioById(id);
      if (docente && docente.id_rol === this.ROL_DOCENTE) {
        const asignaciones = this.localStorageService.getAsignaciones()
          .filter(a => a.id_usuario === id && a.estado === 'ACTIVO');
        const materias = this.localStorageService.getMaterias();
        
        const materiasDocente = asignaciones.map(asig => {
          const materia = materias.find(m => m.id === asig.id_materia);
          return materia ? materia.nombre : null;
        }).filter(nombre => nombre !== null) as string[];

        const docenteCarga: DocenteCarga = {
          id: docente.id,
          id_usuario: docente.id,
          name: docente.name,
          email: docente.email,
          legajo: docente.legajo,
          dni: docente.dni,
          fecha_nacimiento: docente.fecha_nacimiento,
          domicilio: docente.domicilio,
          telefono: docente.telefono,
          id_rol: docente.id_rol,
          area: docente.area,
          fecha_ingreso: docente.fecha_ingreso,
          is_active: docente.is_active,
          created_at: docente.created_at,
          estado: docente.is_active ? 'Activo' : 'Inactivo',
          cantidadMaterias: asignaciones.length,
          cantidadEstudiantes: 0,
          materias: materiasDocente
        };

        observer.next(docenteCarga);
        observer.complete();
      } else {
        observer.error(new Error('Docente no encontrado'));
      }
    });
  }

  getUsuariosRegulares(page = 1, limit = 10): Observable<any[]> {
    return new Observable(observer => {
      const usuarios = this.localStorageService.getUsuarios()
        .filter(u => u.id_rol === this.ROL_USUARIO)
        .map(u => ({
          ...u,
          id_usuario: u.id
        }));
      observer.next(usuarios);
      observer.complete();
    });
  }

  asignarRol(usuarioId: number, rolId: number): Observable<any> {
    return new Observable(observer => {
      const success = this.localStorageService.updateUsuario(usuarioId, { id_rol: rolId });
      if (success) {
        observer.next({ success: true });
        observer.complete();
      } else {
        observer.error(new Error('Usuario no encontrado'));
      }
    });
  }

  actualizarDocente(id: number, docente: Partial<DocenteCarga>): Observable<DocenteCarga> {
    return new Observable(observer => {
      const success = this.localStorageService.updateUsuario(id, docente as any);
      if (success) {
        const docenteActualizado = this.localStorageService.getUsuarioById(id);
        if (docenteActualizado) {
          observer.next({
            ...docenteActualizado,
            id_usuario: docenteActualizado.id,
            estado: docenteActualizado.is_active ? 'Activo' : 'Inactivo',
            cantidadMaterias: 0,
            cantidadEstudiantes: 0
          } as DocenteCarga);
          observer.complete();
        }
      } else {
        observer.error(new Error('Docente no encontrado'));
      }
    });
  }

  getEstadisticas(): Observable<{ totalDocentes: number }> {
    return new Observable(observer => {
      const docentes = this.localStorageService.getUsuarios()
        .filter(u => u.id_rol === this.ROL_DOCENTE);
      observer.next({ totalDocentes: docentes.length });
      observer.complete();
    });
  }
}
