import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-legales-principal-component',
  imports: [RouterOutlet],
  templateUrl: './legales-principal-component.html',
  styleUrl: './legales-principal-component.scss',
})
export class LegalesPrincipalComponent {
  private readonly router = inject(Router);

  navigate(path: string): void {
    this.router.navigate([path]).then(() => {});
  }
}
