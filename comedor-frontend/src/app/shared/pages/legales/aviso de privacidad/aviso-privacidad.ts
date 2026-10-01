import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aviso-privacidad',
  imports: [],
  templateUrl: './aviso-privacidad.html',
  styleUrl: './aviso-privacidad.scss',
})
export class AvisoPrivacidad {
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/legales']);
  }
}
