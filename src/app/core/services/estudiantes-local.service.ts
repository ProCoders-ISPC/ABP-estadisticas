import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

export interface EstudianteLocal {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  legajo: string;
  fecha_nacimiento?: string;
  domicilio?: string;
  telefono?: string;
  estado: 'Activo' | 'Inactivo';
  fecha_ingreso?: string;
  docenteId?: number;
  docenteNombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesLocalService {
  
  constructor(private localStorageService: LocalStorageService) {}

  getEstudiantes(): Observable<EstudianteLocal[]> {
    return new Observable(observer => {
      const usuarios = this.localStorageService.getUsuarios();
      const estudiantes = usuarios
        .filter(u => u.id_rol === 3)
        .map(u => {
          const nombres = u.name.split(' ');
          const apellido = nombres.length > 1 ? nombres.slice(1).join(' ') : '';
          const nombre = nombres[0] || '';
          
          return {
            id: u.id,
            nombre: nombre,
            apellido: apellido,
            dni: u.dni,
            email: u.email,
            legajo: u.legajo,
            fecha_nacimiento: u.fecha_nacimiento,
            domicilio: u.domicilio,
            telefono: u.telefono,
            estado: u.is_active ? 'Activo' : 'Inactivo',
            fecha_ingreso: u.fecha_ingreso
          } as EstudianteLocal;
        });
      
      observer.next(estudiantes);
      observer.complete();
    });
  }

  getEstudiante(id: number): Observable<EstudianteLocal | null> {
    return new Observable(observer => {
      const usuario = this.localStorageService.getUsuarioById(id);
      if (usuario && usuario.id_rol === 3) {
        const nombres = usuario.name.split(' ');
        const apellido = nombres.length > 1 ? nombres.slice(1).join(' ') : '';
        const nombre = nombres[0] || '';
        
        const estudiante: EstudianteLocal = {
          id: usuario.id,
          nombre: nombre,
          apellido: apellido,
          dni: usuario.dni,
          email: usuario.email,
          legajo: usuario.legajo,
          fecha_nacimiento: usuario.fecha_nacimiento,
          domicilio: usuario.domicilio,
          telefono: usuario.telefono,
          estado: usuario.is_active ? 'Activo' : 'Inactivo',
          fecha_ingreso: usuario.fecha_ingreso
        };
        
        observer.next(estudiante);
        observer.complete();
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  addEstudiante(estudiante: Omit<EstudianteLocal, 'id'>): Observable<EstudianteLocal> {
    return new Observable(observer => {
      const nuevoUsuario = {
        id: 0, // Se asignará automáticamente
        email: estudiante.email,
        password: 'Estudiante123', // Contraseña por defecto
        name: `${estudiante.nombre} ${estudiante.apellido}`,
        id_rol: 3,
        legajo: estudiante.legajo,
        dni: estudiante.dni,
        fecha_nacimiento: estudiante.fecha_nacimiento || '',
        domicilio: estudiante.domicilio || '',
        telefono: estudiante.telefono || '',
        fecha_ingreso: new Date().toISOString(),
        area: '',
        is_active: estudiante.estado === 'Activo',
        created_at: new Date().toISOString(),
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'azul'
      };

      this.localStorageService.addUsuario(nuevoUsuario);
      
      const estudianteCreado: EstudianteLocal = {
        id: nuevoUsuario.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        dni: estudiante.dni,
        email: estudiante.email,
        legajo: estudiante.legajo,
        fecha_nacimiento: estudiante.fecha_nacimiento,
        domicilio: estudiante.domicilio,
        telefono: estudiante.telefono,
        estado: estudiante.estado,
        fecha_ingreso: nuevoUsuario.fecha_ingreso
      };

      observer.next(estudianteCreado);
      observer.complete();
    });
  }

  updateEstudiante(id: number, estudiante: Partial<EstudianteLocal>): Observable<EstudianteLocal> {
    return new Observable(observer => {
      const datosActualizar: any = {};
      
      if (estudiante.nombre || estudiante.apellido) {
        const nombre = estudiante.nombre || '';
        const apellido = estudiante.apellido || '';
        datosActualizar.name = `${nombre} ${apellido}`.trim();
      }
      
      if (estudiante.email) datosActualizar.email = estudiante.email;
      if (estudiante.dni) datosActualizar.dni = estudiante.dni;
      if (estudiante.legajo) datosActualizar.legajo = estudiante.legajo;
      if (estudiante.fecha_nacimiento) datosActualizar.fecha_nacimiento = estudiante.fecha_nacimiento;
      if (estudiante.domicilio) datosActualizar.domicilio = estudiante.domicilio;
      if (estudiante.telefono) datosActualizar.telefono = estudiante.telefono;
      if (estudiante.estado) datosActualizar.is_active = estudiante.estado === 'Activo';

      const success = this.localStorageService.updateUsuario(id, datosActualizar);
      
      if (success) {
        const usuarioActualizado = this.localStorageService.getUsuarioById(id);
        if (usuarioActualizado) {
          const nombres = usuarioActualizado.name.split(' ');
          const apellidoAct = nombres.length > 1 ? nombres.slice(1).join(' ') : '';
          const nombreAct = nombres[0] || '';
          
          const estudianteActualizado: EstudianteLocal = {
            id: usuarioActualizado.id,
            nombre: nombreAct,
            apellido: apellidoAct,
            dni: usuarioActualizado.dni,
            email: usuarioActualizado.email,
            legajo: usuarioActualizado.legajo,
            fecha_nacimiento: usuarioActualizado.fecha_nacimiento,
            domicilio: usuarioActualizado.domicilio,
            telefono: usuarioActualizado.telefono,
            estado: usuarioActualizado.is_active ? 'Activo' : 'Inactivo',
            fecha_ingreso: usuarioActualizado.fecha_ingreso
          };
          
          observer.next(estudianteActualizado);
          observer.complete();
          return;
        }
      }
      
      observer.error(new Error('Estudiante no encontrado'));
    });
  }

  deleteEstudiante(id: number): Observable<void> {
    return new Observable(observer => {
      const success = this.localStorageService.deleteUsuario(id);
      if (success) {
        observer.next();
        observer.complete();
      } else {
        observer.error(new Error('Estudiante no encontrado'));
      }
    });
  }
}
