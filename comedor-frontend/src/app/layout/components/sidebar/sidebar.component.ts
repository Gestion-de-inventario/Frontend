import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { TourModalComponent } from '../tour-modal/tour-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TourModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('sidebarElement') sidebarElement!: ElementRef;
  @ViewChild(TourModalComponent) tourModal!: TourModalComponent;

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
      if (diff > 70) {
        const offcanvas = bootstrap.Offcanvas.getInstance(element);
        offcanvas?.hide();
      }
    });

    setTimeout(() => {
      this.abrirTourInicialSiCorresponde();
    }, 800);

    window.addEventListener('password-modal-closed', () => {
      setTimeout(() => {
        this.abrirTourInicialSiCorresponde(true);
      }, 300);
    });
  }

  iniciarTour(): void {
    this.closeOffcanvas();
    setTimeout(() => {
      this.tourModal.abrir();
    }, 400);
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

  private abrirTourInicialSiCorresponde(ignorarPasswordPendiente = false): void {
    const session = this.authState.session();

    if (!session) return;

    if (!ignorarPasswordPendiente && session.passwordChanged === false) return;

    const yaVio = localStorage.getItem(`tour_completado_${session.id}`);

    if (!yaVio) {
      this.tourModal.abrir();
    }
  }

  logout(): void {
    this.closeOffcanvas();
    this.authState.logout().subscribe({
      next: () => this.router.navigateByUrl('/login', { replaceUrl: true }),
      error: () => this.router.navigateByUrl('/login', { replaceUrl: true }),
    });
  }

  isActiveRoute(path: string): boolean {
    const currentUrl = this.router.url.split('?')[0];

    if (path === '/dashboard') {
      return currentUrl === '/dashboard';
    }

    return currentUrl === path || currentUrl.startsWith(`${path}/`);
  }
}
