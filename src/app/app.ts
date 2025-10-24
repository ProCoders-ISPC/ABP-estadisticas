import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResaltadorService } from './core/services/resaltador.service';
import { DatosDemoService } from './core/services/datos-demo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('profesort-frontend');

  constructor(
    private resaltadorService: ResaltadorService,
    private datosDemoService: DatosDemoService
  ) {
    // El servicio se inicializa automáticamente
    
    // Exponer funciones de depuración globalmente
    (window as any).cargarDatosDemo = () => {
      console.log('🔄 Limpiando localStorage...');
      localStorage.clear();
      console.log('🔄 Cargando datos de demostración...');
      this.datosDemoService.cargarDatosDemo();
      console.log('✅ Datos cargados. Recargando página...');
      setTimeout(() => location.reload(), 1000);
    };

    (window as any).resetearSistema = () => {
      if (confirm('¿Eliminar todos los datos del sistema?')) {
        localStorage.clear();
        console.log('🗑️ Sistema reseteado. Recargando...');
        location.reload();
      }
    };

    console.log('🛠️ Funciones de depuración disponibles:');
    console.log('  - cargarDatosDemo() : Limpia y carga datos de ejemplo');
    console.log('  - resetearSistema() : Elimina todos los datos');
  }
}
