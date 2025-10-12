import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, EstudianteAsistencia } from '../../../core/services/asistencia.service';
import { MateriasService, Materia } from '../../../core/services/materias.service';
import { EstudiantesService, Estudiante } from '../../../core/services/estudiantes.service';
import { AuthService } from '../../../core/services/services';

@Component({
  selector: 'app-asistencia-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="asistencia-container">
      <h2>📋 Toma de Asistencia</h2>
      
      <!-- Selector de materia y fecha -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label for="materiaSelect">Materia</label>
            <select 
              id="materiaSelect" 
              class="form-control" 
              [(ngModel)]="materiaSeleccionada" 
              (change)="cargarEstudiantes()"
            >
              <option [ngValue]="null">Seleccione una materia</option>
              @for (materia of materias; track materia.id) {
                <option [ngValue]="materia">{{ materia.nombre }} ({{ materia.codigo }})</option>
              }
            </select>
          </div>
          
          <div class="form-group">
            <label for="fechaInput">Fecha</label>
            <input 
              type="date" 
              id="fechaInput" 
              class="form-control" 
              [(ngModel)]="fechaSeleccionada"
              [max]="fechaHoy"
              (change)="cargarEstudiantes()"
            />
          </div>
        </div>
      </div>

      @if (cargando) {
        <div class="loading-indicator">
          <div class="spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">
          {{ error }}
        </div>
      }

      @if (mensaje) {
        <div class="alert alert-success">
          {{ mensaje }}
        </div>
      }

      <!-- Tabla de estudiantes -->
      @if (estudiantes.length > 0 && materiaSeleccionada && fechaSeleccionada) {
        <div class="estudiantes-section">
          <div class="section-header">
            <h3>Estudiantes de {{ materiaSeleccionada.nombre }}</h3>
            <p class="fecha-info">Fecha: {{ fechaSeleccionada | date: 'dd/MM/yyyy' }}</p>
          </div>

          <!-- Acciones rápidas -->
          <div class="acciones-rapidas">
            <button class="btn btn-success" (click)="marcarTodosPresentes()">
              ✓ Marcar todos presentes
            </button>
            <button class="btn btn-danger" (click)="marcarTodosAusentes()">
              ✗ Marcar todos ausentes
            </button>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Legajo</th>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (estudiante of estudiantes; track estudiante.id) {
                <tr [class.row-presente]="estudiante.estado === 'PRESENTE'"
                    [class.row-ausente]="estudiante.estado === 'AUSENTE'"
                    [class.row-tardanza]="estudiante.estado === 'TARDANZA'">
                  <td>{{ estudiante.legajo }}</td>
                  <td>{{ estudiante.nombre }}</td>
                  <td>
                    <span class="badge-estado" [class]="'badge-' + (estudiante.estado || 'sin-registro')">
                      {{ getEstadoTexto(estudiante.estado) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button 
                        class="btn-mini btn-success" 
                        (click)="marcarEstado(estudiante, 'PRESENTE')"
                        [class.active]="estudiante.estado === 'PRESENTE'"
                        title="Presente"
                      >
                        ✓
                      </button>
                      <button 
                        class="btn-mini btn-warning" 
                        (click)="marcarEstado(estudiante, 'TARDANZA')"
                        [class.active]="estudiante.estado === 'TARDANZA'"
                        title="Tardanza"
                      >
                        ⏰
                      </button>
                      <button 
                        class="btn-mini btn-danger" 
                        (click)="marcarEstado(estudiante, 'AUSENTE')"
                        [class.active]="estudiante.estado === 'AUSENTE'"
                        title="Ausente"
                      >
                        ✗
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Resumen -->
          <div class="resumen-asistencia">
            <div class="resumen-card">
              <span class="resumen-numero">{{ contarEstado('PRESENTE') }}</span>
              <span class="resumen-label">Presentes</span>
            </div>
            <div class="resumen-card">
              <span class="resumen-numero">{{ contarEstado('AUSENTE') }}</span>
              <span class="resumen-label">Ausentes</span>
            </div>
            <div class="resumen-card">
              <span class="resumen-numero">{{ contarEstado('TARDANZA') }}</span>
              <span class="resumen-label">Tardanzas</span>
            </div>
            <div class="resumen-card">
              <span class="resumen-numero">{{ calcularPorcentaje() }}%</span>
              <span class="resumen-label">Asistencia</span>
            </div>
          </div>

          <!-- Botón guardar -->
          <div class="actions-footer">
            <button class="btn btn-primary btn-lg" (click)="guardarAsistencia()" [disabled]="guardando">
              @if (guardando) {
                <span>Guardando...</span>
              } @else {
                <span>💾 Guardar Asistencia</span>
              }
            </button>
          </div>
        </div>
      }

      @if (materiaSeleccionada && fechaSeleccionada && estudiantes.length === 0 && !cargando) {
        <div class="alert alert-info">
          No hay estudiantes inscritos en esta materia.
        </div>
      }
    </div>
  `,
  styles: [`
    .asistencia-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      color: #043237;
      margin-bottom: 30px;
      font-size: 2rem;
    }

    .form-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #495057;
    }

    .form-control {
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .estudiantes-section {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-header {
      margin-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 15px;
    }

    .section-header h3 {
      margin: 0 0 5px 0;
      color: #2c3e50;
    }

    .fecha-info {
      color: #6c757d;
      margin: 0;
      font-size: 14px;
    }

    .acciones-rapidas {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .table th,
    .table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    .table tbody tr {
      transition: background 0.3s;
    }

    .table tbody tr:hover {
      background: #f8f9fa;
    }

    .table tbody tr.row-presente {
      background: rgba(40, 167, 69, 0.05);
    }

    .table tbody tr.row-ausente {
      background: rgba(220, 53, 69, 0.05);
    }

    .table tbody tr.row-tardanza {
      background: rgba(255, 193, 7, 0.05);
    }

    .badge-estado {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-PRESENTE {
      background: #d4edda;
      color: #155724;
    }

    .badge-AUSENTE {
      background: #f8d7da;
      color: #721c24;
    }

    .badge-TARDANZA {
      background: #fff3cd;
      color: #856404;
    }

    .badge-sin-registro {
      background: #e9ecef;
      color: #6c757d;
    }

    .btn-group {
      display: flex;
      gap: 5px;
    }

    .btn-mini {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
      background: #e9ecef;
      color: #495057;
    }

    .btn-mini.btn-success {
      background: #d4edda;
      color: #155724;
    }

    .btn-mini.btn-warning {
      background: #fff3cd;
      color: #856404;
    }

    .btn-mini.btn-danger {
      background: #f8d7da;
      color: #721c24;
    }

    .btn-mini.active {
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .btn-mini.btn-success.active {
      background: #28a745;
      color: white;
    }

    .btn-mini.btn-warning.active {
      background: #ffc107;
      color: #212529;
    }

    .btn-mini.btn-danger.active {
      background: #dc3545;
      color: white;
    }

    .resumen-asistencia {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .resumen-card {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .resumen-numero {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .resumen-label {
      font-size: 14px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .actions-footer {
      text-align: center;
      margin-top: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,123,255,0.3);
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-lg {
      padding: 15px 40px;
      font-size: 16px;
    }

    .loading-indicator {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alert {
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-danger {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .acciones-rapidas {
        flex-direction: column;
      }

      .table {
        font-size: 12px;
      }

      .table th,
      .table td {
        padding: 8px 10px;
      }

      .resumen-asistencia {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
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
    // Aquí deberías cargar solo las materias del docente actual
    this.materiasService.getMaterias().subscribe({
      next: (materias) => {
        this.materias = materias;
      },
      error: (err) => {
        console.error('Error al cargar materias:', err);
        this.error = 'Error al cargar las materias';
      }
    });
  }

  cargarEstudiantes(): void {
    if (!this.materiaSeleccionada || !this.fechaSeleccionada) {
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    // Cargar todos los estudiantes y las asistencias de la fecha
    Promise.all([
      this.estudiantesService.getEstudiantes().toPromise(),
      this.asistenciaService.getAsistenciasByMateriaYFecha(
        this.materiaSeleccionada.id,
        this.fechaSeleccionada
      ).toPromise()
    ]).then(([estudiantes, asistencias]) => {
      // Mapear estudiantes con sus asistencias
      this.estudiantes = (estudiantes || []).map(est => {
        const asistencia = (asistencias || []).find(a => a.id_estudiante === est.id);
        return {
          id: est.id,
          nombre: `${est.nombre} ${est.apellidos || ''}`,
          legajo: est.legajo,
          estado: asistencia?.estado,
          asistenciaId: asistencia?.id
        };
      });
      this.cargando = false;
    }).catch((err) => {
      console.error('Error al cargar estudiantes:', err);
      this.error = 'Error al cargar estudiantes y asistencia';
      this.cargando = false;
    });
  }

  marcarEstado(estudiante: EstudianteAsistencia, estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'): void {
    estudiante.estado = estado;
  }

  marcarTodosPresentes(): void {
    this.estudiantes.forEach(est => est.estado = 'PRESENTE');
  }

  marcarTodosAusentes(): void {
    this.estudiantes.forEach(est => est.estado = 'AUSENTE');
  }

  contarEstado(estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'): number {
    return this.estudiantes.filter(e => e.estado === estado).length;
  }

  calcularPorcentaje(): number {
    const total = this.estudiantes.length;
    if (total === 0) return 0;
    const presentes = this.contarEstado('PRESENTE');
    const tardanzas = this.contarEstado('TARDANZA');
    return Math.round(((presentes + tardanzas * 0.5) / total) * 100);
  }

  getEstadoTexto(estado?: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'): string {
    if (!estado) return 'Sin registrar';
    const textos = {
      'PRESENTE': 'Presente',
      'AUSENTE': 'Ausente',
      'TARDANZA': 'Tardanza'
    };
    return textos[estado];
  }

  guardarAsistencia(): void {
    if (!this.materiaSeleccionada || !this.fechaSeleccionada) {
      this.error = 'Debe seleccionar una materia y una fecha';
      return;
    }

    // Validar que todos los estudiantes tengan un estado
    const sinEstado = this.estudiantes.filter(e => !e.estado);
    if (sinEstado.length > 0) {
      this.error = `Hay ${sinEstado.length} estudiantes sin estado de asistencia`;
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    // Preparar datos de asistencia
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
}
