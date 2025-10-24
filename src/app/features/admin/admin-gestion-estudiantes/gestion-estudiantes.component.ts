import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CursosEstudiantesComponent } from '../admin-estudiantes/cursos-estudiantes.component';
import { BannerAlertasComponent } from '../../../shared/components/banner-alertas/banner-alertas';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, CursosEstudiantesComponent, BannerAlertasComponent],
  templateUrl: './gestion-estudiantes.component.html',
  styleUrls: ['./gestion-estudiantes.component.css']
})
export class GestionEstudiantesComponent implements OnInit {
  activeTab: string = 'listado';

  ngOnInit(): void {
    console.log('[GestionEstudiantes] Componente inicializado.');
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
