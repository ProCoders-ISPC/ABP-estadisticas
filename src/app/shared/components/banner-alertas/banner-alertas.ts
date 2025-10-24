import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertasService, Alerta } from '../../../core/services/alertas.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Importar Swiper
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectCards } from 'swiper/modules';

@Component({
  selector: 'app-banner-alertas',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './banner-alertas.html',
  styleUrls: ['./banner-alertas.css']
})
export class BannerAlertasComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() categoria?: 'asistencia' | 'carga-docente' | 'materias' | 'distribucion'; // Filtro por categoría
  @Output() accionAlerta = new EventEmitter<Alerta>();
  
  alertasTop: Alerta[] = [];
  alertaActual: Alerta | null = null;
  indiceActual: number = 0;
  minimizado: boolean = false;
  cerrado: boolean = false;
  
  private subscription?: Subscription;
  private swiper?: Swiper;

  constructor(
    private alertasService: AlertasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
    
    // Recargar alertas cada 30 segundos (tiempo real)
    this.subscription = interval(30000).pipe(
      switchMap(() => this.alertasService.getAlertas())
    ).subscribe(resumen => {
      this.actualizarAlertas(resumen.alertas);
    });

    // Escuchar cambios para actualización
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('alertas-actualizadas', this.handleAlertasActualizadas);
    
    // Escuchar eventos de datos actualizados para recalcular alertas
    ['datos-actualizados', 'docente-agregado', 'docente-actualizado', 'estudiante-agregado', 'materia-agregada', 'materia-eliminada', 'asignacion-actualizada'].forEach(eventName => {
      window.addEventListener(eventName, () => {
        console.log(`[BannerAlertas] Evento ${eventName} recibido, recargando alertas...`);
        setTimeout(() => this.cargarAlertas(), 300);
      });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inicializarSwiper(), 100);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.swiper?.destroy();
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('alertas-actualizadas', this.handleAlertasActualizadas);
    
    // Limpiar listeners de eventos de datos actualizados
    ['datos-actualizados', 'docente-agregado', 'docente-actualizado', 'estudiante-agregado', 'materia-agregada', 'materia-eliminada', 'asignacion-actualizada'].forEach(eventName => {
      window.removeEventListener(eventName, () => {});
    });
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === 'profesort_alertas' || event.key === null) {
      this.cargarAlertas();
    }
  }

  private handleAlertasActualizadas = (event: Event): void => {
    const customEvent = event as CustomEvent;
    const resumen = customEvent.detail;
    if (resumen && resumen.alertas) {
      this.actualizarAlertas(resumen.alertas);
    }
  }

  cargarAlertas(): void {
    this.alertasService.getAlertas().subscribe({
      next: (resumen) => {
        this.actualizarAlertas(resumen.alertas);
      },
      error: (error) => {
        console.error('Error al cargar alertas en banner:', error);
      }
    });
  }

  private actualizarAlertas(alertas: Alerta[]): void {
    // Filtrar por categoría si está especificada
    let alertasFiltradas = alertas;
    if (this.categoria) {
      alertasFiltradas = alertas.filter(a => a.categoria === this.categoria);
    }
    
    // Tomar las 5 alertas más prioritarias
    this.alertasTop = alertasFiltradas
      .sort((a, b) => b.prioridad - a.prioridad)
      .slice(0, 5);
    
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }

    if (this.alertasTop.length > 0) {
      this.alertaActual = this.alertasTop[0];
      this.cerrado = false;
      
      setTimeout(() => {
        this.inicializarSwiper();
      }, 100);
    } else {
      this.cerrado = false; 
    }
  }

  private inicializarSwiper(): void {
    if (this.alertasTop.length === 0) return;
    
    const swiperEl = document.querySelector('.swiper-alertas') as any;
    if (!swiperEl) return;

    this.swiper = new Swiper(swiperEl, {
      modules: [Navigation, Pagination, Autoplay, EffectCards],
      effect: 'cards',
      grabCursor: true,
      cardsEffect: {
        perSlideOffset: 8,
        perSlideRotate: 2,
        rotate: true,
        slideShadows: true,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      speed: 600,
      on: {
        slideChange: (swiper) => {
          this.indiceActual = swiper.realIndex;
          this.alertaActual = this.alertasTop[this.indiceActual];
        }
      }
    });
  }

  siguiente(): void {
    this.swiper?.slideNext();
  }

  anterior(): void {
    this.swiper?.slidePrev();
  }

  toggleMinimizar(): void {
    this.minimizado = !this.minimizado;
  }

  cerrar(): void {
    this.cerrado = true;
  }

  getColorClase(): string {
    if (!this.alertaActual) return 'banner-informativa';
    
    switch (this.alertaActual.tipo) {
      case 'critica':
        return 'banner-critica';
      case 'advertencia':
        return 'banner-advertencia';
      case 'informativa':
        return 'banner-informativa';
      default:
        return 'banner-informativa';
    }
  }

  getIcono(): string {
    if (!this.alertaActual) return '📌';
    
    switch (this.alertaActual.tipo) {
      case 'critica':
        return '🔴';
      case 'advertencia':
        return '🟡';
      case 'informativa':
        return '🟢';
      default:
        return '📌';
    }
  }

  getTipoTexto(): string {
    if (!this.alertaActual) return 'INFO';
    
    switch (this.alertaActual.tipo) {
      case 'critica':
        return 'CRÍTICO';
      case 'advertencia':
        return 'ADVERTENCIA';
      case 'informativa':
        return 'INFO';
      default:
        return 'INFO';
    }
  }

  ejecutarAccion(): void {
    if (!this.alertaActual) return;
    this.ejecutarAccionAlerta(this.alertaActual);
  }

  ejecutarAccionAlerta(alerta: Alerta): void {
    if (!alerta) return;
    
    // Emitir evento para que el componente padre maneje la acción
    this.accionAlerta.emit(alerta);
    
    // Navegar al panel correspondiente según la categoría con información específica
    switch (alerta.categoria) {
      case 'materias':
        this.router.navigate(['/admin/materias']).then(() => {
          setTimeout(() => this.resaltarYScroll('materias', alerta), 800);
        });
        break;
      case 'carga-docente':
        // Para alertas de sobrecarga, navegar con información específica
        if (alerta.titulo?.includes('sobrecargado')) {
          this.router.navigate(['/admin/docentes'], { 
            queryParams: { 
              filtro: 'sobrecargados',
              alerta: alerta.id 
            } 
          }).then(() => {
            setTimeout(() => this.resaltarYScroll('docentes-sobrecargados', alerta), 800);
          });
        } else if (alerta.titulo?.includes('subutilizado')) {
          this.router.navigate(['/admin/docentes'], { 
            queryParams: { 
              filtro: 'subutilizados',
              alerta: alerta.id 
            } 
          }).then(() => {
            setTimeout(() => this.resaltarYScroll('docentes-subutilizados', alerta), 800);
          });
        } else {
          this.router.navigate(['/admin/docentes']).then(() => {
            setTimeout(() => this.resaltarYScroll('docentes', alerta), 800);
          });
        }
        break;
      case 'asistencia':
        this.router.navigate(['/admin/estudiantes']).then(() => {
          setTimeout(() => this.resaltarYScroll('estudiantes-criticos', alerta), 800);
        });
        break;
      case 'distribucion':
        this.router.navigate(['/admin/informes']).then(() => {
          setTimeout(() => this.resaltarYScroll('distribucion-areas', alerta), 800);
        });
        break;
    }
  }

  private resaltarYScroll(seccion: string, alerta: Alerta): void {
    // 1. Buscar elemento a resaltar
    const elemento = document.querySelector(`[data-alerta-${seccion}]`) 
      || document.querySelector(`[id*="${seccion}"]`)
      || document.querySelector(`[class*="${seccion}"]`);
    
    if (elemento) {
      // 2. Agregar clase de resaltado
      elemento.classList.add('alerta-highlight');
      
      // 3. Scroll suave hasta el elemento
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 4. Parpadeo visual
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          elemento.classList.toggle('alerta-highlight-pulse');
        }, 500 * i);
      }
      
      // 5. Remover resaltado después de 5 segundos
      setTimeout(() => {
        elemento.classList.remove('alerta-highlight', 'alerta-highlight-pulse');
      }, 5000);
    }
    
    // 6. Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('resaltar-alerta', { 
      detail: {
        alerta,
        seccion
      }
    }));
  }

  getColorClaseAlerta(alerta: Alerta): string {
    switch (alerta.tipo) {
      case 'critica':
        return 'alerta-critica';
      case 'advertencia':
        return 'alerta-advertencia';
      case 'informativa':
        return 'alerta-informativa';
      default:
        return 'alerta-informativa';
    }
  }

  getIconoAlerta(alerta: Alerta): string {
    switch (alerta.tipo) {
      case 'critica':
        return '🔴';
      case 'advertencia':
        return '🟡';
      case 'informativa':
        return '🟢';
      default:
        return '📌';
    }
  }

  getTipoTextoAlerta(alerta: Alerta): string {
    switch (alerta.tipo) {
      case 'critica':
        return 'CRÍTICO';
      case 'advertencia':
        return 'ADVERTENCIA';
      case 'informativa':
        return 'INFO';
      default:
        return 'INFO';
    }
  }
}