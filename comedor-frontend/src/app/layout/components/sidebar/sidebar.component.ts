import {
  Component,
  inject,
  AfterViewInit,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { TourModalComponent } from '../tour-modal/tour-modal.component';
import { EmpresaConfigService } from '@features/profile/services/empresa-config.service';

declare const bootstrap: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TourModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  @ViewChild('sidebarElement') sidebarElement!: ElementRef;
  @ViewChild(TourModalComponent) tourModal!: TourModalComponent;

  private touchStartX = 0;
  readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly empresaConfigService = inject(EmpresaConfigService);
  readonly empresaLogo = this.empresaConfigService.logoDataUrl;
  readonly openGroup = signal<string | null>(this.getGroupForPath(this.router.url));

  ngOnInit(): void {
    this.empresaConfigService.obtener().subscribe({
      error: () => {
        // El logo es decorativo: el menú debe seguir funcionando si no está configurado.
      },
    });
  }

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
    const group = this.getGroupForPath(path);
    if (group) this.openGroup.set(group);

    this.router.navigate([path]).then(() => {
      this.closeOffcanvas();
    });
  }

  toggleGroup(group: string): void {
    this.openGroup.update((current) => (current === group ? null : group));
  }

  isGroupOpen(group: string): boolean {
    return this.openGroup() === group;
  }

  isGroupActive(path: string): boolean {
    return this.router.url.split('?')[0].startsWith(path);
  }

  private getGroupForPath(path: string): string | null {
    if (path.startsWith('/management')) return 'users';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/roles')) return 'roles';
    if (path.startsWith('/reports')) return 'reports';
    return null;
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

  getManagementRoute(): string {
    const auth = this.authState;

    if (
      auth.hasPermission('USER_LIST_ALL') ||
      auth.hasPermission('USER_LIST_ACTIVE') ||
      auth.hasPermission('USER_CREATE')
    ) {
      return '/management/users';
    }

    if (
      auth.hasPermission('BENEFICIARY_LIST_BY_STATUS') ||
      auth.hasPermission('BENEFICIARY_CREATE') ||
      auth.hasPermission('BENEFICIARY_CREATE_BY_DNI')
    ) {
      return '/management/beneficiaries';
    }

    if (
      auth.hasPermission('BENEFICIARY_TYPE_LIST_BY_STATUS') ||
      auth.hasPermission('BENEFICIARY_TYPE_CREATE')
    ) {
      return '/management/beneficiary-types';
    }

    return '/management';
  }
}
