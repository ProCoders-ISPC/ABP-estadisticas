import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  dni: string;
  legajo: string;
  fechaNacimiento: string;
  domicilio: string;
  telefono: string;
  confirmarEmail: string;
  confirmarPassword: string;
  terminos: boolean;
  pregunta_secreta: string;
  respuesta_secreta: string;
}

export interface RecoverPasswordRequest {
  email: string;
  respuesta_secreta: string;
  nueva_password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthUser {
  id: number;
  name: string; 
  email: string;
  id_rol: number;
  legajo: string;
  dni: string;
  fecha_nacimiento: string;
  domicilio: string;
  telefono: string;
  area: string;
  fecha_ingreso: string;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private useLocalStorage = true; // Cambiar a false para usar API real
  
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    this.loadSavedSession();
  }

  private loadSavedSession(): void {
    const savedUser = sessionStorage.getItem('currentUser');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        
        
        const authUser: AuthUser = {
          id: user.id || user.id_usuario || 0,
          name: user.name || `${user.nombre || ''} ${user.apellido || ''}`.trim() || '',
          email: user.email || '',
          id_rol: user.id_rol || (user.id_rol === 'Admin' ? 1 : 2),
          legajo: user.legajo || '',
          dni: user.dni || '',
          fecha_nacimiento: user.fecha_nacimiento || user.fechaNacimiento || '',
          domicilio: user.domicilio || '',
          telefono: user.telefono || '',
          area: user.area || '',
          fecha_ingreso: user.fecha_ingreso || user.createdAt || '',
          is_active: user.is_active !== undefined ? user.is_active : (user.isActive || true)
        };
        
        this.currentUserSubject.next(authUser);
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        this.clearSession();
      }
    }
  }

  private saveSession(user: AuthUser): void {
    
    const normalizedUser: AuthUser = {
      id: user.id || (user as any).id_usuario || 0,
      name: user.name || '',
      email: user.email || '',
      id_rol: user.id_rol || 2,
      legajo: user.legajo || '',
      dni: user.dni || '',
      fecha_nacimiento: user.fecha_nacimiento || '',
      domicilio: user.domicilio || '',
      telefono: user.telefono || '',
      area: user.area || '',
      fecha_ingreso: user.fecha_ingreso || '',
      is_active: user.is_active !== undefined ? user.is_active : true
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(normalizedUser));
  }

  private clearSession(): void {
    sessionStorage.removeItem('currentUser');
  }

  login(email: string, password: string): Observable<ApiResponse<AuthUser>> {
    if (this.useLocalStorage) {
      return this.loginLocal(email, password);
    }
    
    const loginData: LoginRequest = { email, password };
    
    return new Observable<ApiResponse<AuthUser>>(observer => {
      this.http.post<ApiResponse<AuthUser>>(`${this.apiUrl}/login/`, loginData)
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.saveSession(response.data);
              this.currentUserSubject.next(response.data);
            }
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error en login service:', error);
            let errorResponse: ApiResponse<AuthUser>;
            
            // Error 403 - Usuario inactivo
            if (error.status === 403) {
              errorResponse = {
                success: false,
                message: 'Tu cuenta está inactiva. Por favor, contacta al administrador para activarla.',
                error: error.error?.error || 'Cuenta desactivada'
              };
            } 
            // Error 401 - Credenciales inválidas
            else if (error.status === 401) {
              errorResponse = {
                success: false,
                message: 'Credenciales inválidas',
                error: error.error?.error || 'Email o contraseña incorrectos'
              };
            } 
            // Error 400 - Datos inválidos
            else if (error.status === 400) {
              errorResponse = {
                success: false,
                message: 'Datos inválidos',
                error: error.error?.message || 'Verifica los datos ingresados'
              };
            }
            // Error 500 - Error del servidor
            else if (error.status === 500) {
              errorResponse = {
                success: false,
                message: 'Error en el servidor',
                error: 'Ocurrió un error en el servidor. Intenta más tarde.'
              };
            }
            // Otros errores (red, timeout, etc.)
            else {
              errorResponse = {
                success: false,
                message: 'Error de conexión',
                error: 'No se pudo conectar al servidor'
              };
            }
            
            observer.next(errorResponse);
            observer.complete();
          }
        });
    });
  }

  private loginLocal(email: string, password: string): Observable<ApiResponse<AuthUser>> {
    return new Observable<ApiResponse<AuthUser>>(observer => {
      const usuario = this.localStorageService.getUsuarioByEmail(email);
      
      if (!usuario) {
        observer.next({
          success: false,
          message: 'Credenciales inválidas',
          error: 'Email o contraseña incorrectos'
        });
        observer.complete();
        return;
      }

      if (!usuario.is_active) {
        observer.next({
          success: false,
          message: 'Tu cuenta está inactiva. Por favor, contacta al administrador para activarla.',
          error: 'Cuenta desactivada'
        });
        observer.complete();
        return;
      }

      if (usuario.password !== password) {
        observer.next({
          success: false,
          message: 'Credenciales inválidas',
          error: 'Email o contraseña incorrectos'
        });
        observer.complete();
        return;
      }

      const authUser: AuthUser = {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        id_rol: usuario.id_rol,
        legajo: usuario.legajo,
        dni: usuario.dni,
        fecha_nacimiento: usuario.fecha_nacimiento,
        domicilio: usuario.domicilio,
        telefono: usuario.telefono,
        area: usuario.area,
        fecha_ingreso: usuario.fecha_ingreso,
        is_active: usuario.is_active
      };

      this.saveSession(authUser);
      this.currentUserSubject.next(authUser);

      observer.next({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: authUser
      });
      observer.complete();
    });
  }

  register(registerData: RegisterRequest): Observable<ApiResponse<any>> {
    if (this.useLocalStorage) {
      return this.registerLocal(registerData);
    }

    return new Observable<ApiResponse<any>>(observer => {
      this.http.post<ApiResponse<any>>(`${this.apiUrl}/register/`, registerData)
        .subscribe({
          next: (response) => {
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            let errorResponse: ApiResponse<any>;
            
            if (error.status === 409) {
              errorResponse = {
                success: false,
                message: 'Usuario ya existe',
                error: error.error?.error || 'Ya existe un usuario con estos datos'
              };
            } else {
              errorResponse = {
                success: false,
                message: 'Error de conexión',
                error: 'No se pudo conectar al servidor'
              };
            }
            
            observer.next(errorResponse);
            observer.complete();
          }
        });
    });
  }

  private registerLocal(registerData: RegisterRequest): Observable<ApiResponse<any>> {
    return new Observable<ApiResponse<any>>(observer => {
      // Verificar si el email ya existe
      const existente = this.localStorageService.getUsuarioByEmail(registerData.email);
      if (existente) {
        observer.next({
          success: false,
          message: 'Usuario ya existe',
          error: 'Ya existe un usuario con este correo electrónico'
        });
        observer.complete();
        return;
      }

      // Verificar si el DNI ya existe
      const usuarios = this.localStorageService.getUsuarios();
      if (usuarios.find(u => u.dni === registerData.dni)) {
        observer.next({
          success: false,
          message: 'DNI ya registrado',
          error: 'Ya existe un usuario con este DNI'
        });
        observer.complete();
        return;
      }

      // Verificar si el legajo ya existe
      if (usuarios.find(u => u.legajo === registerData.legajo)) {
        observer.next({
          success: false,
          message: 'Legajo ya registrado',
          error: 'Ya existe un usuario con este legajo'
        });
        observer.complete();
        return;
      }

      const nuevoUsuario = {
        id: 0, // Se asignará automáticamente
        email: registerData.email,
        password: registerData.password,
        name: `${registerData.nombre} ${registerData.apellido}`,
        id_rol: 3, // Usuario regular
        legajo: registerData.legajo,
        dni: registerData.dni,
        fecha_nacimiento: registerData.fechaNacimiento,
        domicilio: registerData.domicilio,
        telefono: registerData.telefono,
        fecha_ingreso: new Date().toISOString(),
        area: '',
        is_active: true,
        created_at: new Date().toISOString(),
        pregunta_secreta: registerData.pregunta_secreta,
        respuesta_secreta: registerData.respuesta_secreta.toLowerCase()
      };

      this.localStorageService.addUsuario(nuevoUsuario);

      observer.next({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: nuevoUsuario
      });
      observer.complete();
    });
  }

  // Nuevo método: Obtener pregunta secreta
  getSecurityQuestion(email: string): Observable<ApiResponse<{pregunta: string}>> {
    return new Observable<ApiResponse<{pregunta: string}>>(observer => {
      const usuario = this.localStorageService.getUsuarioByEmail(email);
      
      if (!usuario) {
        observer.next({
          success: false,
          message: 'Usuario no encontrado',
          error: 'No existe un usuario con este correo electrónico'
        });
      } else if (!usuario.pregunta_secreta) {
        observer.next({
          success: false,
          message: 'Sin pregunta de seguridad',
          error: 'Este usuario no tiene configurada una pregunta de seguridad'
        });
      } else {
        observer.next({
          success: true,
          message: 'Pregunta obtenida',
          data: { pregunta: usuario.pregunta_secreta }
        });
      }
      observer.complete();
    });
  }

  // Nuevo método: Recuperar contraseña
  recoverPassword(data: RecoverPasswordRequest): Observable<ApiResponse<any>> {
    return new Observable<ApiResponse<any>>(observer => {
      const usuario = this.localStorageService.getUsuarioByEmail(data.email);
      
      if (!usuario) {
        observer.next({
          success: false,
          message: 'Usuario no encontrado',
          error: 'No existe un usuario con este correo electrónico'
        });
        observer.complete();
        return;
      }

      if (!usuario.respuesta_secreta) {
        observer.next({
          success: false,
          message: 'Sin pregunta de seguridad',
          error: 'Este usuario no tiene configurada una pregunta de seguridad'
        });
        observer.complete();
        return;
      }

      if (usuario.respuesta_secreta.toLowerCase() !== data.respuesta_secreta.toLowerCase()) {
        observer.next({
          success: false,
          message: 'Respuesta incorrecta',
          error: 'La respuesta a la pregunta secreta es incorrecta'
        });
        observer.complete();
        return;
      }

      // Actualizar contraseña
      this.localStorageService.updateUsuario(usuario.id, {
        password: data.nueva_password
      });

      observer.next({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
      observer.complete();
    });
  }

  logout(): void {
    this.clearSession();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser !== null && currentUser.id_rol === 1;
  }

  isUser(): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser !== null && currentUser.id_rol === 2;
  }
  
  getCurrentUser(): AuthUser | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    
    
    return {
      id: user.id || (user as any).id_usuario || 0,
      name: user.name || '',
      email: user.email || '',
      id_rol: user.id_rol || 2,
      legajo: user.legajo || '',
      dni: user.dni || '',
      fecha_nacimiento: user.fecha_nacimiento || '',
      domicilio: user.domicilio || '',
      telefono: user.telefono || '',
      area: user.area || '',
      fecha_ingreso: user.fecha_ingreso || '',
      is_active: user.is_active !== undefined ? user.is_active : true
    };
  }

  getSessionData() {
    const user = this.getCurrentUser();
    return {
      isLoggedIn: user !== null,
      rol: user?.id_rol === 1 ? 'Admin' : 'User',
      user: user
    };
  }

  
  refreshUserSession(): void {
    this.loadSavedSession();
  }

 
  validateSession(): Observable<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/validate-session/${currentUser.id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            
            this.saveSession(response.data);
            return true;
          } else {
            
            this.clearSession();
            return false;
          }
        }),
        catchError(() => {
      
          this.clearSession();
          return of(false);
        })
      );
  }
}
