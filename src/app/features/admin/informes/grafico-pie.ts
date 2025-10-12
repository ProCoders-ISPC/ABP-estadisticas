import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grafico-pie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafico-container">
      @if (datos) {
        <h3 class="grafico-titulo">{{ datos.titulo }}</h3>
        <div class="pie-chart-wrapper">
          <svg #svgElement [attr.viewBox]="'0 0 ' + width + ' ' + height" class="pie-svg">
            <!-- Segmentos del gráfico -->
            @for (segmento of segmentos; track segmento.label; let i = $index) {
              <g>
                <path
                  [attr.d]="segmento.path"
                  [attr.fill]="segmento.color"
                  [attr.stroke]="'#fff'"
                  [attr.stroke-width]="2"
                  class="pie-segment"
                  (mouseenter)="onSegmentHover(i)"
                  (mouseleave)="onSegmentLeave()"
                  [class.active]="hoveredIndex === i"
                >
                  <title>{{ segmento.label }}: {{ segmento.value }} ({{ segmento.percentage }}%)</title>
                </path>
                
                <!-- Etiquetas -->
                @if (segmento.percentage > 5) {
                  <text
                    [attr.x]="segmento.labelX"
                    [attr.y]="segmento.labelY"
                    class="pie-label"
                    text-anchor="middle"
                  >
                    {{ segmento.percentage }}%
                  </text>
                }
              </g>
            }
            
            <!-- Círculo central opcional para efecto donut -->
            @if (donutStyle) {
              <circle
                [attr.cx]="centerX"
                [attr.cy]="centerY"
                [attr.r]="innerRadius"
                fill="#fff"
              />
            }
          </svg>
          
          <!-- Leyenda -->
          <div class="leyenda">
            @for (item of datos.datos; track item.label; let i = $index) {
              <div 
                class="leyenda-item"
                [class.active]="hoveredIndex === i"
                (mouseenter)="onSegmentHover(i)"
                (mouseleave)="onSegmentLeave()"
              >
                <div class="leyenda-color" [style.background-color]="datos.colores[i % datos.colores.length]"></div>
                <span class="leyenda-label">{{ item.label }}</span>
                <span class="leyenda-value">{{ item.value }} ({{ getPercentage(item.value) }}%)</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .grafico-container {
      width: 100%;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }

    .grafico-titulo {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 1.3rem;
    }

    .pie-chart-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
    }

    .pie-svg {
      max-width: 400px;
      width: 100%;
      height: auto;
    }

    .pie-segment {
      cursor: pointer;
      transition: opacity 0.3s, transform 0.3s;
      transform-origin: center;
    }

    .pie-segment:hover,
    .pie-segment.active {
      opacity: 0.8;
      filter: brightness(1.1);
    }

    .pie-label {
      font-size: 14px;
      font-weight: bold;
      fill: #fff;
      pointer-events: none;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }

    .leyenda {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 600px;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 6px;
      transition: background 0.3s;
      cursor: pointer;
    }

    .leyenda-item:hover,
    .leyenda-item.active {
      background: #e9ecef;
    }

    .leyenda-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .leyenda-label {
      flex: 1;
      font-weight: 600;
      color: #495057;
      font-size: 14px;
    }

    .leyenda-value {
      color: #6c757d;
      font-size: 13px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .leyenda {
        grid-template-columns: 1fr;
      }
      
      .pie-svg {
        max-width: 300px;
      }
    }
  `]
})
export class GraficoPieComponent implements OnChanges, AfterViewInit {
  @Input() datos: any;
  @Input() donutStyle: boolean = false;
  @ViewChild('svgElement') svgElement?: ElementRef;

  width = 400;
  height = 400;
  centerX = 200;
  centerY = 200;
  radius = 150;
  innerRadius = 60; // Para estilo donut

  segmentos: any[] = [];
  hoveredIndex: number = -1;
  total: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos) {
      this.calcularSegmentos();
    }
  }

  ngAfterViewInit(): void {
    if (this.datos) {
      this.calcularSegmentos();
    }
  }

  calcularSegmentos(): void {
    if (!this.datos || !this.datos.datos || this.datos.datos.length === 0) {
      return;
    }

    this.total = this.datos.datos.reduce((sum: number, item: any) => sum + item.value, 0);
    
    let currentAngle = -90; // Empezar desde arriba

    this.segmentos = this.datos.datos.map((item: any, index: number) => {
      const percentage = this.total > 0 ? (item.value / this.total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Calcular el path del segmento
      const path = this.createArcPath(
        this.centerX,
        this.centerY,
        this.radius,
        startAngle,
        endAngle,
        this.donutStyle ? this.innerRadius : 0
      );
      
      // Calcular posición de la etiqueta (en el centro del segmento)
      const labelAngle = startAngle + angle / 2;
      const labelRadius = this.donutStyle ? (this.radius + this.innerRadius) / 2 : this.radius * 0.7;
      const labelX = this.centerX + labelRadius * Math.cos(this.degreesToRadians(labelAngle));
      const labelY = this.centerY + labelRadius * Math.sin(this.degreesToRadians(labelAngle));
      
      currentAngle = endAngle;
      
      return {
        label: item.label,
        value: item.value,
        percentage: Math.round(percentage * 10) / 10,
        color: this.datos.colores[index % this.datos.colores.length],
        path,
        labelX,
        labelY
      };
    });
  }

  createArcPath(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    innerRadius: number = 0
  ): string {
    const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    if (innerRadius > 0) {
      // Path para estilo donut
      const innerStart = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);
      const innerEnd = this.polarToCartesian(centerX, centerY, innerRadius, startAngle);
      
      return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z'
      ].join(' ');
    } else {
      // Path para gráfico completo
      return [
        'M', centerX, centerY,
        'L', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'Z'
      ].join(' ');
    }
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = this.degreesToRadians(angleInDegrees);
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  getPercentage(value: number): string {
    const percentage = this.total > 0 ? (value / this.total) * 100 : 0;
    return (Math.round(percentage * 10) / 10).toString();
  }

  onSegmentHover(index: number): void {
    this.hoveredIndex = index;
  }

  onSegmentLeave(): void {
    this.hoveredIndex = -1;
  }
}
