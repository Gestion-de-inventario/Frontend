import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';

declare const bootstrap: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('sidebarElement')
  sidebarElement!: ElementRef;

  private touchStartX = 0;

  readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

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

  navigateAndClose(path: string): void {
    this.router.navigate([path]).then(() => {
      this.closeOffcanvas();
    });
  }

  private closeOffcanvas(): void {
    if (this.sidebarElement) {
      const element = this.sidebarElement.nativeElement;
      const offcanvas =
        bootstrap.Offcanvas.getInstance(element) || new bootstrap.Offcanvas(element);

      if (offcanvas) {
        offcanvas.hide();
      }
    }
  }

  logout(): void {
    // Cerramos el menú por precaución visual antes del logout
    this.closeOffcanvas();

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
