import { AfterViewInit, Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '@layout/components/sidebar/sidebar.component';

import { NavbarComponent } from '@layout/components/navbar/navbar.component';

import { ToastComponent } from '@shared/components/toast/toast.component';

declare const bootstrap: any;

@Component({
  selector: 'app-shell-page',

  standalone: true,

  imports: [RouterOutlet, SidebarComponent, NavbarComponent, ToastComponent],

  templateUrl: './app-shell.page.html',

  styleUrls: ['./app-shell.page.scss'],
})
export class AppShellPage implements AfterViewInit {
  private touchStartX = 0;

  ngAfterViewInit(): void {
    document.addEventListener('touchstart', (event: TouchEvent) => {
      this.touchStartX = event.touches[0].clientX;
    });

    document.addEventListener('touchmove', (event: TouchEvent) => {
      const currentX = event.touches[0].clientX;

      const diff = currentX - this.touchStartX;

      // iniciar cerca al borde izquierdo
      const startedFromEdge = this.touchStartX < 25;

      // swipe derecha
      if (startedFromEdge && diff > 80) {
        const sidebar = document.getElementById('appSidebar');

        if (!sidebar) {
          return;
        }

        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(sidebar);

        offcanvas.show();
      }
    });
  }
}
