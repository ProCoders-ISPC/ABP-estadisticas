import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResaltadorService {

  constructor() {
    // Escuchar el evento personalizado de resaltar
    window.addEventListener('resaltar-alerta', (event: any) => {
      this.resaltarElementosPorAlerta(event.detail);
    });
  }

  /**
   * Resalta elementos en el DOM según la alerta
   */
  private resaltarElementosPorAlerta(alerta: any): void {
    if (!alerta) return;

    console.log('Resaltando alerta:', alerta);

    // Esperar a que la navegación se complete
    setTimeout(() => {
      const categoria = alerta.categoria;
      const datosAdicionales = alerta.datosAdicionales;

      switch (categoria) {
        case 'carga-docente':
          this.resaltarDocentes(datosAdicionales);
          break;
        case 'asistencia':
          this.resaltarEstudiantes(datosAdicionales);
          break;
        case 'materias':
          this.resaltarMaterias(datosAdicionales);
          break;
        case 'distribucion':
          this.resaltarDistribucion(datosAdicionales);
          break;
      }
    }, 800);
  }

  /**
   * Resalta docentes con problemas
   */
  private resaltarDocentes(datos: any): void {
    if (!datos || !datos.docentes) return;

    const docentes = datos.docentes;
    
    docentes.forEach((docente: any, index: number) => {
      setTimeout(() => {
        // Buscar todas las tarjetas de docentes
        const tarjetasDocentes = document.querySelectorAll('.docente-card, .teacher-card, [data-docente]');
        
        tarjetasDocentes.forEach((tarjeta: Element) => {
          const texto = tarjeta.textContent || '';
          
          // Verificar si contiene el nombre del docente
          if (texto.includes(docente.nombre) || texto.includes(docente.cantidadMaterias?.toString())) {
            this.aplicarResaltado(tarjeta as HTMLElement, 'pulse-green');
            this.scrollToElement(tarjeta as HTMLElement);
          }
        });
      }, index * 300);
    });
  }

  /**
   * Resalta estudiantes con problemas
   */
  private resaltarEstudiantes(datos: any): void {
    if (!datos || !datos.estudiantes) return;

    const estudiantes = datos.estudiantes;
    
    estudiantes.forEach((estudiante: any, index: number) => {
      setTimeout(() => {
        const tarjetasEstudiantes = document.querySelectorAll('.estudiante-row, .student-card, [data-estudiante], tbody tr');
        
        tarjetasEstudiantes.forEach((tarjeta: Element) => {
          const texto = tarjeta.textContent || '';
          
          // Verificar si contiene el nombre o legajo del estudiante
          if (texto.includes(estudiante.nombre) || texto.includes(estudiante.legajo)) {
            this.aplicarResaltado(tarjeta as HTMLElement, 'pulse-red');
            this.scrollToElement(tarjeta as HTMLElement);
          }
        });
      }, index * 300);
    });
  }

  /**
   * Resalta materias sin asignar
   */
  private resaltarMaterias(datos: any): void {
    // Buscar materias sin asignar en la interfaz
    const materiasSinAsignar = document.querySelectorAll('[data-sin-asignar="true"], .materia-sin-asignar, .sin-docente');
    
    materiasSinAsignar.forEach((materia: Element, index: number) => {
      setTimeout(() => {
        this.aplicarResaltado(materia as HTMLElement, 'pulse-yellow');
        if (index === 0) {
          this.scrollToElement(materia as HTMLElement);
        }
      }, index * 200);
    });

    // Si no hay atributos específicos, buscar por contenido
    if (materiasSinAsignar.length === 0) {
      const todasLasMaterias = document.querySelectorAll('.materia-card, .materia-row, [data-materia]');
      
      todasLasMaterias.forEach((materia: Element, index: number) => {
        const texto = materia.textContent || '';
        
        if (texto.includes('Sin asignar') || texto.includes('Sin docente') || texto.includes('No asignado')) {
          setTimeout(() => {
            this.aplicarResaltado(materia as HTMLElement, 'pulse-yellow');
            if (index === 0) {
              this.scrollToElement(materia as HTMLElement);
            }
          }, index * 200);
        }
      });
    }
  }

  /**
   * Resalta problemas de distribución
   */
  private resaltarDistribucion(datos: any): void {
    if (!datos || !datos.areas) return;

    const areas = datos.areas;
    
    areas.forEach((area: string, index: number) => {
      setTimeout(() => {
        const elementosArea = document.querySelectorAll(`[data-area="${area}"], .area-${area}`);
        
        elementosArea.forEach((elemento: Element) => {
          this.aplicarResaltado(elemento as HTMLElement, 'pulse-orange');
        });
      }, index * 300);
    });
  }

  /**
   * Aplica el efecto de resaltado parpadeante
   */
  private aplicarResaltado(elemento: HTMLElement, animationClass: string): void {
    // Agregar clase de animación
    elemento.classList.add(animationClass);
    
    // Agregar estilos inline
    const originalBoxShadow = elemento.style.boxShadow;
    const originalBorder = elemento.style.border;
    const originalTransition = elemento.style.transition;
    
    elemento.style.transition = 'all 0.3s ease';
    elemento.style.border = '3px solid var(--highlight-color, #28a745)';
    elemento.style.boxShadow = '0 0 20px var(--highlight-color, rgba(40, 167, 69, 0.6))';
    
    // Remover después de 5 segundos
    setTimeout(() => {
      elemento.classList.remove(animationClass);
      elemento.style.boxShadow = originalBoxShadow;
      elemento.style.border = originalBorder;
      elemento.style.transition = originalTransition;
    }, 5000);
  }

  /**
   * Hace scroll suave hasta el elemento
   */
  private scrollToElement(elemento: HTMLElement): void {
    const offset = 100; // Espacio superior para el banner
    const elementPosition = elemento.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Método público para resaltar manualmente
   */
  public resaltarElemento(selector: string, color: 'green' | 'red' | 'yellow' | 'orange' = 'green'): void {
    const elementos = document.querySelectorAll(selector);
    const animationClass = `pulse-${color}`;
    
    elementos.forEach((elemento: Element, index: number) => {
      setTimeout(() => {
        this.aplicarResaltado(elemento as HTMLElement, animationClass);
        if (index === 0) {
          this.scrollToElement(elemento as HTMLElement);
        }
      }, index * 200);
    });
  }
}
