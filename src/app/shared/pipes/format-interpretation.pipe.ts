import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatInterpretation',
  standalone: true
})
export class FormatInterpretationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    return value
      // Convertir markdown básico a HTML
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• /gm, '• ')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^📊|🔍|📈|🎯|💡|👥|⚖️|🏷️|📚|🎓|🚨|⚠️/gm, '<span class="emoji">$&</span>')
      // Envolver en párrafos
      .replace(/^(.+)$/gm, '<p>$1</p>')
      // Limpiar párrafos vacíos
      .replace(/<p><\/p>/g, '')
      // Aplicar estilos específicos
      .replace(/<p>(.+?):<\/p>/g, '<h5 class="interpretation-subtitle">$1:</h5>')
      .replace(/🟢|✅|🏆/g, '<span class="status-excellent">$&</span>')
      .replace(/🟡/g, '<span class="status-good">$&</span>')
      .replace(/🟠|⚠️/g, '<span class="status-warning">$&</span>')
      .replace(/🔴|🚨/g, '<span class="status-critical">$&</span>');
  }
}