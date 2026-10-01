import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos-uso',
  imports: [RouterLink],
  templateUrl: './terminos-uso.html',
  styleUrl: './terminos-uso.scss',
})
export class TerminosUso {
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/legales']);
  }
}
