import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { AuthStateService } from '@core/auth/services/auth-state.service';

declare const bootstrap: any;

@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [RouterLink],

  templateUrl: './sidebar.component.html',

  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('sidebarElement')
  sidebarElement!: ElementRef;

  private touchStartX = 0;

  ngAfterViewInit(): void {
    const element = this.sidebarElement.nativeElement;

    element.addEventListener('touchstart', (event: TouchEvent) => {
      this.touchStartX = event.touches[0].clientX;
    });

    element.addEventListener('touchmove', (event: TouchEvent) => {
      const currentX = event.touches[0].clientX;

      const diff = this.touchStartX - currentX;

      // swipe izquierda
      if (diff > 70) {
        const offcanvas = bootstrap.Offcanvas.getInstance(element);

        offcanvas?.hide();
      }
    });
  }

  readonly authState = inject(AuthStateService);

  private readonly router = inject(Router);

  logout(): void {
    this.authState.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
    });
  }
}
