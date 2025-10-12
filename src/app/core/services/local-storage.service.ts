import { Injectable } from '@angular/core';

export interface UsuarioLocal {
  id: number;
  email: string;
  password: string;
  name: string;
  id_rol: number; // 1=Admin, 2=Docente, 3=Estudiante
  legajo: string;
  dni: string;
  fecha_nacimiento: string;
  domicilio: string;
  telefono: string;
  fecha_ingreso: string;
  area: string;
  is_active: boolean;
  created_at: string;
  pregunta_secreta?: string;
  respuesta_secreta?: string;
}

export interface MateriaLocal {
  id: number;
  nombre: string;
  codigo: string;
  horas_semanales?: number;
  area?: string;
  nivel?: string;
  docenteId?: number;
  docenteNombre?: string;
  docenteLegajo?: string;
  docenteDni?: string;
}

export interface AsignacionLocal {
  id: number;
  id_rol: number;
  id_materia: number;
  id_usuario: number;
  fecha_asignacion: string;
  estado: string;
}

export interface AsistenciaLocal {
  id: number;
  id_estudiante: number;
  id_materia: number;
  id_docente: number;
  fecha: string; // YYYY-MM-DD
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA';
  observaciones?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private USUARIOS_KEY = 'profesort_usuarios';
  private MATERIAS_KEY = 'profesort_materias';
  private ASIGNACIONES_KEY = 'profesort_asignaciones';
  private ASISTENCIAS_KEY = 'profesort_asistencias';
  private INITIALIZED_KEY = 'profesort_initialized';

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    const initialized = localStorage.getItem(this.INITIALIZED_KEY);
    if (!initialized) {
      this.loadInitialData();
      localStorage.setItem(this.INITIALIZED_KEY, 'true');
    }
  }

  private loadInitialData(): void {
    // Datos iniciales de usuarios
    const usuarios: UsuarioLocal[] = [
      // 1 Admin
      {
        id: 1,
        email: 'admin@profesort.com',
        password: 'Admin123',
        name: 'Administrador Principal',
        id_rol: 1,
        legajo: 'ADMIN001',
        dni: '12345678',
        fecha_nacimiento: '1980-01-01',
        domicilio: 'Sistema Administrativo',
        telefono: '3888888888',
        fecha_ingreso: '2024-01-01',
        area: 'ADMINISTRACION',
        is_active: true,
        created_at: '2024-01-01',
        pregunta_secreta: '¿Cuál es tu color favorito?',
        respuesta_secreta: 'azul'
      },
      // 20 Docentes
      {
        id: 2,
        email: 'karina.quinteros@profesort.com',
        password: 'Docente123',
        name: 'Karina del Valle Quinteros',
        id_rol: 2,
        legajo: 'DOC001',
        dni: '28456789',
        fecha_nacimiento: '1980-05-15',
        domicilio: 'Av. Libertador 1234',
        telefono: '3517883811',
        fecha_ingreso: '2024-01-15',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-01-15',
        pregunta_secreta: '¿Nombre de tu primera mascota?',
        respuesta_secreta: 'luna'
      },
      {
        id: 3,
        email: 'juan.sanchez@profesort.com',
        password: 'Docente123',
        name: 'Juan Pablo Sanchez Brandán',
        id_rol: 2,
        legajo: 'DOC002',
        dni: '32456123',
        fecha_nacimiento: '1985-08-22',
        domicilio: 'Calle San Martín 567',
        telefono: '3515678901',
        fecha_ingreso: '2024-01-20',
        area: 'SOCIALES',
        is_active: true,
        created_at: '2024-01-20',
        pregunta_secreta: '¿Ciudad donde naciste?',
        respuesta_secreta: 'córdoba'
      },
      {
        id: 4,
        email: 'cristian.vargas@profesort.com',
        password: 'Docente123',
        name: 'Cristian Vargas',
        id_rol: 2,
        legajo: 'DOC003',
        dni: '35165185',
        fecha_nacimiento: '1996-01-10',
        domicilio: 'Barrio Alberdi 234',
        telefono: '3517883811',
        fecha_ingreso: '2024-02-01',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-02-01',
        pregunta_secreta: '¿Nombre de tu madre?',
        respuesta_secreta: 'maría'
      },
      {
        id: 5,
        email: 'maria.rodriguez@profesort.com',
        password: 'Docente123',
        name: 'María Fernanda Rodriguez',
        id_rol: 2,
        legajo: 'DOC004',
        dni: '31234567',
        fecha_nacimiento: '1987-03-12',
        domicilio: 'Av. Colón 890',
        telefono: '3516789012',
        fecha_ingreso: '2024-02-05',
        area: 'LENGUA',
        is_active: true,
        created_at: '2024-02-05',
        pregunta_secreta: '¿Tu libro favorito?',
        respuesta_secreta: 'cien años de soledad'
      },
      {
        id: 6,
        email: 'carlos.gomez@profesort.com',
        password: 'Docente123',
        name: 'Carlos Alberto Gomez',
        id_rol: 2,
        legajo: 'DOC005',
        dni: '29876543',
        fecha_nacimiento: '1983-11-08',
        domicilio: 'Bv. San Juan 456',
        telefono: '3518901234',
        fecha_ingreso: '2024-02-10',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-02-10',
        pregunta_secreta: '¿Nombre de tu padre?',
        respuesta_secreta: 'juan'
      },
      {
        id: 7,
        email: 'laura.martinez@profesort.com',
        password: 'Docente123',
        name: 'Laura Beatriz Martinez',
        id_rol: 2,
        legajo: 'DOC006',
        dni: '33456789',
        fecha_nacimiento: '1990-06-20',
        domicilio: 'Calle Belgrano 123',
        telefono: '3519012345',
        fecha_ingreso: '2024-02-15',
        area: 'SOCIALES',
        is_active: true,
        created_at: '2024-02-15',
        pregunta_secreta: '¿Cuál es tu color favorito?',
        respuesta_secreta: 'verde'
      },
      {
        id: 8,
        email: 'roberto.fernandez@profesort.com',
        password: 'Docente123',
        name: 'Roberto Alejandro Fernandez',
        id_rol: 2,
        legajo: 'DOC007',
        dni: '34567890',
        fecha_nacimiento: '1988-09-15',
        domicilio: 'Av. Vélez Sarsfield 789',
        telefono: '3510123456',
        fecha_ingreso: '2024-02-20',
        area: 'EDUCACION_FISICA',
        is_active: true,
        created_at: '2024-02-20',
        pregunta_secreta: '¿Deporte favorito?',
        respuesta_secreta: 'fútbol'
      },
      {
        id: 9,
        email: 'ana.lopez@profesort.com',
        password: 'Docente123',
        name: 'Ana Carolina Lopez',
        id_rol: 2,
        legajo: 'DOC008',
        dni: '30123456',
        fecha_nacimiento: '1986-04-25',
        domicilio: 'Barrio Cerro 345',
        telefono: '3511234567',
        fecha_ingreso: '2024-03-01',
        area: 'LENGUA',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Ciudad donde naciste?',
        respuesta_secreta: 'rosario'
      },
      {
        id: 10,
        email: 'diego.perez@profesort.com',
        password: 'Docente123',
        name: 'Diego Martín Perez',
        id_rol: 2,
        legajo: 'DOC009',
        dni: '32789012',
        fecha_nacimiento: '1989-12-03',
        domicilio: 'Calle Rivadavia 567',
        telefono: '3512345678',
        fecha_ingreso: '2024-03-05',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-03-05',
        pregunta_secreta: '¿Nombre de tu primera mascota?',
        respuesta_secreta: 'toby'
      },
      {
        id: 11,
        email: 'patricia.castro@profesort.com',
        password: 'Docente123',
        name: 'Patricia Soledad Castro',
        id_rol: 2,
        legajo: 'DOC010',
        dni: '31890123',
        fecha_nacimiento: '1987-07-18',
        domicilio: 'Av. Rafael Núñez 234',
        telefono: '3513456789',
        fecha_ingreso: '2024-03-10',
        area: 'SOCIALES',
        is_active: true,
        created_at: '2024-03-10',
        pregunta_secreta: '¿Tu comida favorita?',
        respuesta_secreta: 'pizza'
      },
      {
        id: 12,
        email: 'fernando.ramirez@profesort.com',
        password: 'Docente123',
        name: 'Fernando Luis Ramirez',
        id_rol: 2,
        legajo: 'DOC011',
        dni: '33901234',
        fecha_nacimiento: '1991-02-14',
        domicilio: 'Bv. Illia 890',
        telefono: '3514567890',
        fecha_ingreso: '2024-03-15',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-03-15',
        pregunta_secreta: '¿Nombre de tu madre?',
        respuesta_secreta: 'rosa'
      },
      {
        id: 13,
        email: 'silvia.torres@profesort.com',
        password: 'Docente123',
        name: 'Silvia Marcela Torres',
        id_rol: 2,
        legajo: 'DOC012',
        dni: '29012345',
        fecha_nacimiento: '1984-10-30',
        domicilio: 'Calle Duarte Quirós 456',
        telefono: '3515678901',
        fecha_ingreso: '2024-03-20',
        area: 'LENGUA',
        is_active: true,
        created_at: '2024-03-20',
        pregunta_secreta: '¿Tu libro favorito?',
        respuesta_secreta: 'el principito'
      },
      {
        id: 14,
        email: 'jorge.morales@profesort.com',
        password: 'Docente123',
        name: 'Jorge Ernesto Morales',
        id_rol: 2,
        legajo: 'DOC013',
        dni: '34123456',
        fecha_nacimiento: '1992-05-22',
        domicilio: 'Av. Amadeo Sabattini 678',
        telefono: '3516789012',
        fecha_ingreso: '2024-03-25',
        area: 'EDUCACION_FISICA',
        is_active: true,
        created_at: '2024-03-25',
        pregunta_secreta: '¿Deporte favorito?',
        respuesta_secreta: 'básquet'
      },
      {
        id: 15,
        email: 'gabriela.silva@profesort.com',
        password: 'Docente123',
        name: 'Gabriela Andrea Silva',
        id_rol: 2,
        legajo: 'DOC014',
        dni: '30234567',
        fecha_nacimiento: '1985-08-07',
        domicilio: 'Barrio Güemes 123',
        telefono: '3517890123',
        fecha_ingreso: '2024-04-01',
        area: 'SOCIALES',
        is_active: true,
        created_at: '2024-04-01',
        pregunta_secreta: '¿Ciudad donde naciste?',
        respuesta_secreta: 'mendoza'
      },
      {
        id: 16,
        email: 'miguel.benitez@profesort.com',
        password: 'Docente123',
        name: 'Miguel Ángel Benitez',
        id_rol: 2,
        legajo: 'DOC015',
        dni: '32345678',
        fecha_nacimiento: '1988-01-19',
        domicilio: 'Calle 27 de Abril 345',
        telefono: '3518901234',
        fecha_ingreso: '2024-04-05',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-04-05',
        pregunta_secreta: '¿Nombre de tu primera mascota?',
        respuesta_secreta: 'max'
      },
      {
        id: 17,
        email: 'cecilia.romero@profesort.com',
        password: 'Docente123',
        name: 'Cecilia Ines Romero',
        id_rol: 2,
        legajo: 'DOC016',
        dni: '31456789',
        fecha_nacimiento: '1986-11-28',
        domicilio: 'Av. Poeta Lugones 567',
        telefono: '3519012345',
        fecha_ingreso: '2024-04-10',
        area: 'LENGUA',
        is_active: true,
        created_at: '2024-04-10',
        pregunta_secreta: '¿Tu comida favorita?',
        respuesta_secreta: 'empanadas'
      },
      {
        id: 18,
        email: 'ricardo.herrera@profesort.com',
        password: 'Docente123',
        name: 'Ricardo Daniel Herrera',
        id_rol: 2,
        legajo: 'DOC017',
        dni: '33567890',
        fecha_nacimiento: '1990-03-16',
        domicilio: 'Bv. Los Granaderos 789',
        telefono: '3510123456',
        fecha_ingreso: '2024-04-15',
        area: 'SOCIALES',
        is_active: true,
        created_at: '2024-04-15',
        pregunta_secreta: '¿Nombre de tu padre?',
        respuesta_secreta: 'carlos'
      },
      {
        id: 19,
        email: 'valeria.mendez@profesort.com',
        password: 'Docente123',
        name: 'Valeria Solange Mendez',
        id_rol: 2,
        legajo: 'DOC018',
        dni: '29678901',
        fecha_nacimiento: '1983-06-09',
        domicilio: 'Calle Obispo Trejo 234',
        telefono: '3511234567',
        fecha_ingreso: '2024-04-20',
        area: 'EDUCACION_FISICA',
        is_active: true,
        created_at: '2024-04-20',
        pregunta_secreta: '¿Deporte favorito?',
        respuesta_secreta: 'voley'
      },
      {
        id: 20,
        email: 'pablo.aguirre@profesort.com',
        password: 'Docente123',
        name: 'Pablo Ezequiel Aguirre',
        id_rol: 2,
        legajo: 'DOC019',
        dni: '34789012',
        fecha_nacimiento: '1993-09-24',
        domicilio: 'Av. Fuerza Aérea 890',
        telefono: '3512345678',
        fecha_ingreso: '2024-04-25',
        area: 'EXACTAS',
        is_active: true,
        created_at: '2024-04-25',
        pregunta_secreta: '¿Cuál es tu color favorito?',
        respuesta_secreta: 'rojo'
      },
      {
        id: 21,
        email: 'susana.torres@profesort.com',
        password: 'Docente123',
        name: 'Susana Beatriz Torres',
        id_rol: 2,
        legajo: 'DOC020',
        dni: '30890123',
        fecha_nacimiento: '1985-12-11',
        domicilio: 'Barrio San Vicente 456',
        telefono: '3513456789',
        fecha_ingreso: '2024-05-01',
        area: 'LENGUA',
        is_active: true,
        created_at: '2024-05-01',
        pregunta_secreta: '¿Tu libro favorito?',
        respuesta_secreta: 'don quijote'
      },
      // 30 Estudiantes
      {
        id: 22,
        email: 'estudiante01@mail.com',
        password: 'Estudiante123',
        name: 'Lucas Matias Gonzalez',
        id_rol: 3,
        legajo: 'EST001',
        dni: '42123456',
        fecha_nacimiento: '2006-01-15',
        domicilio: 'Calle Falsa 123',
        telefono: '3514567890',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'spiderman'
      },
      {
        id: 23,
        email: 'estudiante02@mail.com',
        password: 'Estudiante123',
        name: 'Sofia Valentina Fernandez',
        id_rol: 3,
        legajo: 'EST002',
        dni: '43234567',
        fecha_nacimiento: '2006-02-20',
        domicilio: 'Av. Siempreviva 742',
        telefono: '3515678901',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'rosa'
      },
      {
        id: 24,
        email: 'estudiante03@mail.com',
        password: 'Estudiante123',
        name: 'Mateo Agustin Rodriguez',
        id_rol: 3,
        legajo: 'EST003',
        dni: '44345678',
        fecha_nacimiento: '2006-03-10',
        domicilio: 'Bv. Principal 456',
        telefono: '3516789012',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'minecraft'
      },
      {
        id: 25,
        email: 'estudiante04@mail.com',
        password: 'Estudiante123',
        name: 'Emma Catalina Martinez',
        id_rol: 3,
        legajo: 'EST004',
        dni: '42456789',
        fecha_nacimiento: '2006-04-25',
        domicilio: 'Calle Central 789',
        telefono: '3517890123',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'gato'
      },
      {
        id: 26,
        email: 'estudiante05@mail.com',
        password: 'Estudiante123',
        name: 'Benjamin Tomas Lopez',
        id_rol: 3,
        legajo: 'EST005',
        dni: '43567890',
        fecha_nacimiento: '2006-05-30',
        domicilio: 'Pasaje Los Alamos 234',
        telefono: '3518901234',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'batman'
      },
      {
        id: 27,
        email: 'estudiante06@mail.com',
        password: 'Estudiante123',
        name: 'Martina Abril Garcia',
        id_rol: 3,
        legajo: 'EST006',
        dni: '44678901',
        fecha_nacimiento: '2006-06-14',
        domicilio: 'Av. Libertad 567',
        telefono: '3519012345',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'celeste'
      },
      {
        id: 28,
        email: 'estudiante07@mail.com',
        password: 'Estudiante123',
        name: 'Thiago Emanuel Perez',
        id_rol: 3,
        legajo: 'EST007',
        dni: '42789012',
        fecha_nacimiento: '2006-07-08',
        domicilio: 'Calle Nueva 890',
        telefono: '3510123456',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'fortnite'
      },
      {
        id: 29,
        email: 'estudiante08@mail.com',
        password: 'Estudiante123',
        name: 'Isabella Milagros Sanchez',
        id_rol: 3,
        legajo: 'EST008',
        dni: '43890123',
        fecha_nacimiento: '2006-08-19',
        domicilio: 'Bv. San Martin 123',
        telefono: '3511234567',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'perro'
      },
      {
        id: 30,
        email: 'estudiante09@mail.com',
        password: 'Estudiante123',
        name: 'Santiago Maximiliano Gomez',
        id_rol: 3,
        legajo: 'EST009',
        dni: '44901234',
        fecha_nacimiento: '2006-09-22',
        domicilio: 'Pasaje Flores 345',
        telefono: '3512345678',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'ironman'
      },
      {
        id: 31,
        email: 'estudiante10@mail.com',
        password: 'Estudiante123',
        name: 'Camila Luz Diaz',
        id_rol: 3,
        legajo: 'EST010',
        dni: '42012345',
        fecha_nacimiento: '2006-10-05',
        domicilio: 'Av. Independencia 678',
        telefono: '3513456789',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'violeta'
      },
      {
        id: 32,
        email: 'estudiante11@mail.com',
        password: 'Estudiante123',
        name: 'Nicolas Ignacio Ruiz',
        id_rol: 3,
        legajo: 'EST011',
        dni: '43123456',
        fecha_nacimiento: '2006-11-12',
        domicilio: 'Calle Mitre 234',
        telefono: '3514567890',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'fifa'
      },
      {
        id: 33,
        email: 'estudiante12@mail.com',
        password: 'Estudiante123',
        name: 'Valentina Mia Torres',
        id_rol: 3,
        legajo: 'EST012',
        dni: '44234567',
        fecha_nacimiento: '2006-12-28',
        domicilio: 'Bv. Italia 567',
        telefono: '3515678901',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'conejo'
      },
      {
        id: 34,
        email: 'estudiante13@mail.com',
        password: 'Estudiante123',
        name: 'Lautaro Facundo Castro',
        id_rol: 3,
        legajo: 'EST013',
        dni: '42345678',
        fecha_nacimiento: '2007-01-17',
        domicilio: 'Pasaje Tucumán 890',
        telefono: '3516789012',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'thor'
      },
      {
        id: 35,
        email: 'estudiante14@mail.com',
        password: 'Estudiante123',
        name: 'Renata Sofia Morales',
        id_rol: 3,
        legajo: 'EST014',
        dni: '43456789',
        fecha_nacimiento: '2007-02-23',
        domicilio: 'Av. Colon 123',
        telefono: '3517890123',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'amarillo'
      },
      {
        id: 36,
        email: 'estudiante15@mail.com',
        password: 'Estudiante123',
        name: 'Felipe Bautista Romero',
        id_rol: 3,
        legajo: 'EST015',
        dni: '44567890',
        fecha_nacimiento: '2007-03-30',
        domicilio: 'Calle Sarmiento 456',
        telefono: '3518901234',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'valorant'
      },
      {
        id: 37,
        email: 'estudiante16@mail.com',
        password: 'Estudiante123',
        name: 'Julieta Delfina Silva',
        id_rol: 3,
        legajo: 'EST016',
        dni: '42678901',
        fecha_nacimiento: '2007-04-11',
        domicilio: 'Bv. Chacabuco 789',
        telefono: '3519012345',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'hamster'
      },
      {
        id: 38,
        email: 'estudiante17@mail.com',
        password: 'Estudiante123',
        name: 'Joaquin Lionel Benitez',
        id_rol: 3,
        legajo: 'EST017',
        dni: '43789012',
        fecha_nacimiento: '2007-05-06',
        domicilio: 'Pasaje Entre Rios 234',
        telefono: '3510123456',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'hulk'
      },
      {
        id: 39,
        email: 'estudiante18@mail.com',
        password: 'Estudiante123',
        name: 'Agustina Pilar Herrera',
        id_rol: 3,
        legajo: 'EST018',
        dni: '44890123',
        fecha_nacimiento: '2007-06-18',
        domicilio: 'Av. Velez Sarsfield 567',
        telefono: '3511234567',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'turquesa'
      },
      {
        id: 40,
        email: 'estudiante19@mail.com',
        password: 'Estudiante123',
        name: 'Tomas Ezequiel Mendez',
        id_rol: 3,
        legajo: 'EST019',
        dni: '42901234',
        fecha_nacimiento: '2007-07-27',
        domicilio: 'Calle Alvear 890',
        telefono: '3512345678',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'gta'
      },
      {
        id: 41,
        email: 'estudiante20@mail.com',
        password: 'Estudiante123',
        name: 'Lola Francesca Navarro',
        id_rol: 3,
        legajo: 'EST020',
        dni: '43012345',
        fecha_nacimiento: '2007-08-09',
        domicilio: 'Bv. Mitre 123',
        telefono: '3513456789',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'tortuga'
      },
      {
        id: 42,
        email: 'estudiante21@mail.com',
        password: 'Estudiante123',
        name: 'Dante Santino Aguirre',
        id_rol: 3,
        legajo: 'EST021',
        dni: '44123456',
        fecha_nacimiento: '2007-09-14',
        domicilio: 'Pasaje Cordoba 456',
        telefono: '3514567890',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'flash'
      },
      {
        id: 43,
        email: 'estudiante22@mail.com',
        password: 'Estudiante123',
        name: 'Olivia Guadalupe Vega',
        id_rol: 3,
        legajo: 'EST022',
        dni: '42234567',
        fecha_nacimiento: '2007-10-21',
        domicilio: 'Av. Yrigoyen 789',
        telefono: '3515678901',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'naranja'
      },
      {
        id: 44,
        email: 'estudiante23@mail.com',
        password: 'Estudiante123',
        name: 'Manuel Sebastian Ortiz',
        id_rol: 3,
        legajo: 'EST023',
        dni: '43345678',
        fecha_nacimiento: '2007-11-03',
        domicilio: 'Calle Junin 234',
        telefono: '3516789012',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'lol'
      },
      {
        id: 45,
        email: 'estudiante24@mail.com',
        password: 'Estudiante123',
        name: 'Lucia Amelia Cabrera',
        id_rol: 3,
        legajo: 'EST024',
        dni: '44456789',
        fecha_nacimiento: '2007-12-16',
        domicilio: 'Bv. Belgrano 567',
        telefono: '3517890123',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'pájaro'
      },
      {
        id: 46,
        email: 'estudiante25@mail.com',
        password: 'Estudiante123',
        name: 'Bruno Alejo Ramos',
        id_rol: 3,
        legajo: 'EST025',
        dni: '42567890',
        fecha_nacimiento: '2008-01-25',
        domicilio: 'Pasaje Mendoza 890',
        telefono: '3518901234',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'superman'
      },
      {
        id: 47,
        email: 'estudiante26@mail.com',
        password: 'Estudiante123',
        name: 'Nina Julieta Flores',
        id_rol: 3,
        legajo: 'EST026',
        dni: '43678901',
        fecha_nacimiento: '2008-02-07',
        domicilio: 'Av. Rivadavia 123',
        telefono: '3519012345',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'fucsia'
      },
      {
        id: 48,
        email: 'estudiante27@mail.com',
        password: 'Estudiante123',
        name: 'Gael Leonardo Sosa',
        id_rol: 3,
        legajo: 'EST027',
        dni: '44789012',
        fecha_nacimiento: '2008-03-20',
        domicilio: 'Calle Pueyrredon 456',
        telefono: '3510123456',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu juego favorito?',
        respuesta_secreta: 'roblox'
      },
      {
        id: 49,
        email: 'estudiante28@mail.com',
        password: 'Estudiante123',
        name: 'Alma Victoria Medina',
        id_rol: 3,
        legajo: 'EST028',
        dni: '42890123',
        fecha_nacimiento: '2008-04-29',
        domicilio: 'Bv. Illia 789',
        telefono: '3511234567',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu mascota favorita?',
        respuesta_secreta: 'pez'
      },
      {
        id: 50,
        email: 'estudiante29@mail.com',
        password: 'Estudiante123',
        name: 'Ian Uriel Suarez',
        id_rol: 3,
        legajo: 'EST029',
        dni: '43901234',
        fecha_nacimiento: '2008-05-11',
        domicilio: 'Pasaje San Juan 234',
        telefono: '3512345678',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu superhéroe favorito?',
        respuesta_secreta: 'capitan america'
      },
      {
        id: 51,
        email: 'estudiante30@mail.com',
        password: 'Estudiante123',
        name: 'Emilia Serena Pereyra',
        id_rol: 3,
        legajo: 'EST030',
        dni: '44012345',
        fecha_nacimiento: '2008-06-24',
        domicilio: 'Av. San Martin 567',
        telefono: '3513456789',
        fecha_ingreso: '2024-03-01',
        area: '',
        is_active: true,
        created_at: '2024-03-01',
        pregunta_secreta: '¿Tu color favorito?',
        respuesta_secreta: 'dorado'
      }
    ];

    // Datos iniciales de materias
    const materias: MateriaLocal[] = [
      { id: 1, nombre: 'Matemática I', codigo: 'MAT101', horas_semanales: 4, area: 'EXACTAS', nivel: 'BASICO' },
      { id: 2, nombre: 'Lengua y Literatura', codigo: 'LEN101', horas_semanales: 4, area: 'LENGUA', nivel: 'BASICO' },
      { id: 3, nombre: 'Historia Argentina', codigo: 'HIS101', horas_semanales: 3, area: 'SOCIALES', nivel: 'BASICO' },
      { id: 4, nombre: 'Educación Física', codigo: 'EDF101', horas_semanales: 2, area: 'EDUCACION_FISICA', nivel: 'BASICO' },
      { id: 5, nombre: 'Física I', codigo: 'FIS101', horas_semanales: 4, area: 'EXACTAS', nivel: 'INTERMEDIO' },
      { id: 6, nombre: 'Química General', codigo: 'QUI101', horas_semanales: 4, area: 'EXACTAS', nivel: 'INTERMEDIO' },
      { id: 7, nombre: 'Geografía Mundial', codigo: 'GEO101', horas_semanales: 3, area: 'SOCIALES', nivel: 'BASICO' },
      { id: 8, nombre: 'Inglés I', codigo: 'ING101', horas_semanales: 3, area: 'LENGUA', nivel: 'BASICO' },
      { id: 9, nombre: 'Biología General', codigo: 'BIO101', horas_semanales: 4, area: 'EXACTAS', nivel: 'BASICO' },
      { id: 10, nombre: 'Educación Ciudadana', codigo: 'CIU101', horas_semanales: 2, area: 'SOCIALES', nivel: 'BASICO' }
    ];

    // Asignaciones de docentes a materias
    const asignaciones: AsignacionLocal[] = [
      { id: 1, id_rol: 2, id_materia: 1, id_usuario: 2, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 2, id_rol: 2, id_materia: 2, id_usuario: 5, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 3, id_rol: 2, id_materia: 3, id_usuario: 3, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 4, id_rol: 2, id_materia: 4, id_usuario: 8, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 5, id_rol: 2, id_materia: 5, id_usuario: 4, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 6, id_rol: 2, id_materia: 6, id_usuario: 6, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 7, id_rol: 2, id_materia: 7, id_usuario: 7, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 8, id_rol: 2, id_materia: 8, id_usuario: 9, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 9, id_rol: 2, id_materia: 9, id_usuario: 10, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' },
      { id: 10, id_rol: 2, id_materia: 10, id_usuario: 11, fecha_asignacion: '2024-03-01', estado: 'ACTIVO' }
    ];

    // Datos iniciales de asistencias (últimas 4 semanas)
    const asistencias: AsistenciaLocal[] = this.generateInitialAsistencias(usuarios, materias);

    localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(usuarios));
    localStorage.setItem(this.MATERIAS_KEY, JSON.stringify(materias));
    localStorage.setItem(this.ASIGNACIONES_KEY, JSON.stringify(asignaciones));
    localStorage.setItem(this.ASISTENCIAS_KEY, JSON.stringify(asistencias));
  }

  private generateInitialAsistencias(usuarios: UsuarioLocal[], materias: MateriaLocal[]): AsistenciaLocal[] {
    const asistencias: AsistenciaLocal[] = [];
    const estudiantes = usuarios.filter(u => u.id_rol === 3);
    const docentes = usuarios.filter(u => u.id_rol === 2);
    
    // Generar asistencias para las últimas 4 semanas (20 días hábiles)
    const today = new Date();
    let asistenciaId = 1;
    
    for (let semana = 0; semana < 4; semana++) {
      for (let dia = 0; dia < 5; dia++) { // 5 días por semana
        const fecha = new Date(today);
        fecha.setDate(fecha.getDate() - ((3 - semana) * 7 + (4 - dia)));
        const fechaStr = fecha.toISOString().split('T')[0];
        
        // Para cada materia (simular 2 materias por día)
        const materiasDelDia = materias.slice(0, 2);
        
        materiasDelDia.forEach(materia => {
          const docenteId = docentes[Math.floor(Math.random() * docentes.length)].id;
          
          // Registrar asistencia para cada estudiante
          estudiantes.forEach(estudiante => {
            // 85% presente, 10% ausente, 5% tardanza
            const rand = Math.random();
            let estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA';
            
            if (rand < 0.85) {
              estado = 'PRESENTE';
            } else if (rand < 0.95) {
              estado = 'AUSENTE';
            } else {
              estado = 'TARDANZA';
            }
            
            asistencias.push({
              id: asistenciaId++,
              id_estudiante: estudiante.id,
              id_materia: materia.id,
              id_docente: docenteId,
              fecha: fechaStr,
              estado: estado,
              observaciones: estado === 'AUSENTE' ? 'Sin justificación' : undefined,
              created_at: new Date().toISOString()
            });
          });
        });
      }
    }
    
    return asistencias;
  }

  // ===== MÉTODOS DE USUARIOS =====
  getUsuarios(): UsuarioLocal[] {
    const data = localStorage.getItem(this.USUARIOS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getUsuarioById(id: number): UsuarioLocal | null {
    const usuarios = this.getUsuarios();
    return usuarios.find(u => u.id === id) || null;
  }

  getUsuarioByEmail(email: string): UsuarioLocal | null {
    const usuarios = this.getUsuarios();
    return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  addUsuario(usuario: UsuarioLocal): void {
    const usuarios = this.getUsuarios();
    usuario.id = Math.max(...usuarios.map(u => u.id), 0) + 1;
    usuario.created_at = new Date().toISOString();
    usuarios.push(usuario);
    localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(usuarios));
  }

  updateUsuario(id: number, datos: Partial<UsuarioLocal>): boolean {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      usuarios[index] = { ...usuarios[index], ...datos };
      localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(usuarios));
      return true;
    }
    return false;
  }

  deleteUsuario(id: number): boolean {
    const usuarios = this.getUsuarios();
    const filtered = usuarios.filter(u => u.id !== id);
    if (filtered.length < usuarios.length) {
      localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  // ===== MÉTODOS DE MATERIAS =====
  getMaterias(): MateriaLocal[] {
    const data = localStorage.getItem(this.MATERIAS_KEY);
    const materias = data ? JSON.parse(data) : [];
    
    // Enriquecer con datos del docente asignado
    const asignaciones = this.getAsignaciones();
    const usuarios = this.getUsuarios();
    
    return materias.map((materia: MateriaLocal) => {
      const asignacion = asignaciones.find(a => a.id_materia === materia.id && a.estado === 'ACTIVO');
      if (asignacion) {
        const docente = usuarios.find(u => u.id === asignacion.id_usuario);
        if (docente) {
          return {
            ...materia,
            docenteId: docente.id,
            docenteNombre: docente.name,
            docenteLegajo: docente.legajo,
            docenteDni: docente.dni
          };
        }
      }
      return materia;
    });
  }

  getMateriaById(id: number): MateriaLocal | null {
    const materias = this.getMaterias();
    return materias.find(m => m.id === id) || null;
  }

  addMateria(materia: MateriaLocal): MateriaLocal {
    const materias = this.getMaterias();
    materia.id = Math.max(...materias.map(m => m.id), 0) + 1;
    materias.push(materia);
    localStorage.setItem(this.MATERIAS_KEY, JSON.stringify(materias));
    return materia;
  }

  updateMateria(id: number, datos: Partial<MateriaLocal>): boolean {
    const materiasData = localStorage.getItem(this.MATERIAS_KEY);
    const materias = materiasData ? JSON.parse(materiasData) : [];
    const index = materias.findIndex((m: MateriaLocal) => m.id === id);
    if (index !== -1) {
      materias[index] = { ...materias[index], ...datos };
      localStorage.setItem(this.MATERIAS_KEY, JSON.stringify(materias));
      return true;
    }
    return false;
  }

  deleteMateria(id: number): boolean {
    const materiasData = localStorage.getItem(this.MATERIAS_KEY);
    const materias = materiasData ? JSON.parse(materiasData) : [];
    const filtered = materias.filter((m: MateriaLocal) => m.id !== id);
    if (filtered.length < materias.length) {
      localStorage.setItem(this.MATERIAS_KEY, JSON.stringify(filtered));
      // También eliminar asignaciones relacionadas
      this.deleteAsignacionesByMateria(id);
      return true;
    }
    return false;
  }

  // ===== MÉTODOS DE ASIGNACIONES =====
  getAsignaciones(): AsignacionLocal[] {
    const data = localStorage.getItem(this.ASIGNACIONES_KEY);
    return data ? JSON.parse(data) : [];
  }

  addAsignacion(asignacion: AsignacionLocal): void {
    const asignaciones = this.getAsignaciones();
    asignacion.id = Math.max(...asignaciones.map(a => a.id), 0) + 1;
    asignaciones.push(asignacion);
    localStorage.setItem(this.ASIGNACIONES_KEY, JSON.stringify(asignaciones));
  }

  updateAsignacion(materiaId: number, docenteId: number | null): boolean {
    const asignaciones = this.getAsignaciones();
    
    // Desactivar asignaciones anteriores para esta materia
    asignaciones.forEach(a => {
      if (a.id_materia === materiaId && a.estado === 'ACTIVO') {
        a.estado = 'INACTIVO';
      }
    });
    
    // Crear nueva asignación si hay docente
    if (docenteId) {
      const nuevaAsignacion: AsignacionLocal = {
        id: Math.max(...asignaciones.map(a => a.id), 0) + 1,
        id_rol: 2,
        id_materia: materiaId,
        id_usuario: docenteId,
        fecha_asignacion: new Date().toISOString(),
        estado: 'ACTIVO'
      };
      asignaciones.push(nuevaAsignacion);
    }
    
    localStorage.setItem(this.ASIGNACIONES_KEY, JSON.stringify(asignaciones));
    return true;
  }

  deleteAsignacionesByMateria(materiaId: number): void {
    const asignaciones = this.getAsignaciones();
    const filtered = asignaciones.filter(a => a.id_materia !== materiaId);
    localStorage.setItem(this.ASIGNACIONES_KEY, JSON.stringify(filtered));
  }

  deleteAsignacionesByUsuario(usuarioId: number): void {
    const asignaciones = this.getAsignaciones();
    const filtered = asignaciones.filter(a => a.id_usuario !== usuarioId);
    localStorage.setItem(this.ASIGNACIONES_KEY, JSON.stringify(filtered));
  }

  // ===== MÉTODOS DE ASISTENCIAS =====
  getAsistencias(): AsistenciaLocal[] {
    const data = localStorage.getItem(this.ASISTENCIAS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getAsistenciasByEstudiante(estudianteId: number): AsistenciaLocal[] {
    return this.getAsistencias().filter(a => a.id_estudiante === estudianteId);
  }

  getAsistenciasByMateria(materiaId: number): AsistenciaLocal[] {
    return this.getAsistencias().filter(a => a.id_materia === materiaId);
  }

  getAsistenciasByFecha(fecha: string): AsistenciaLocal[] {
    return this.getAsistencias().filter(a => a.fecha === fecha);
  }

  getAsistenciasByMateriaYFecha(materiaId: number, fecha: string): AsistenciaLocal[] {
    return this.getAsistencias().filter(a => 
      a.id_materia === materiaId && a.fecha === fecha
    );
  }

  addAsistencia(asistencia: AsistenciaLocal): AsistenciaLocal {
    const asistencias = this.getAsistencias();
    asistencia.id = Math.max(...asistencias.map(a => a.id), 0) + 1;
    asistencia.created_at = new Date().toISOString();
    asistencias.push(asistencia);
    localStorage.setItem(this.ASISTENCIAS_KEY, JSON.stringify(asistencias));
    return asistencia;
  }

  addAsistenciasLote(asistencias: Omit<AsistenciaLocal, 'id' | 'created_at'>[]): AsistenciaLocal[] {
    const asistenciasActuales = this.getAsistencias();
    let maxId = Math.max(...asistenciasActuales.map(a => a.id), 0);
    
    const nuevasAsistencias: AsistenciaLocal[] = asistencias.map(a => ({
      ...a,
      id: ++maxId,
      created_at: new Date().toISOString()
    }));
    
    asistenciasActuales.push(...nuevasAsistencias);
    localStorage.setItem(this.ASISTENCIAS_KEY, JSON.stringify(asistenciasActuales));
    return nuevasAsistencias;
  }

  updateAsistencia(id: number, datos: Partial<AsistenciaLocal>): boolean {
    const asistencias = this.getAsistencias();
    const index = asistencias.findIndex(a => a.id === id);
    if (index !== -1) {
      asistencias[index] = { ...asistencias[index], ...datos };
      localStorage.setItem(this.ASISTENCIAS_KEY, JSON.stringify(asistencias));
      return true;
    }
    return false;
  }

  deleteAsistencia(id: number): boolean {
    const asistencias = this.getAsistencias();
    const filtered = asistencias.filter(a => a.id !== id);
    if (filtered.length < asistencias.length) {
      localStorage.setItem(this.ASISTENCIAS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  // ===== MÉTODOS AUXILIARES =====
  resetData(): void {
    localStorage.removeItem(this.USUARIOS_KEY);
    localStorage.removeItem(this.MATERIAS_KEY);
    localStorage.removeItem(this.ASIGNACIONES_KEY);
    localStorage.removeItem(this.ASISTENCIAS_KEY);
    localStorage.removeItem(this.INITIALIZED_KEY);
    this.initializeData();
  }

  exportData(): string {
    return JSON.stringify({
      usuarios: this.getUsuarios(),
      materias: this.getMaterias(),
      asignaciones: this.getAsignaciones()
    }, null, 2);
  }
}
