import { Component, inject } from '@angular/core';

import { LayoutStateService } from '@layout/services/LayoutStateService';

@Component({
  selector: 'app-hamburger-button',

  standalone: true,

  templateUrl: './hamburger-button.component.html',

  styleUrls: ['./hamburger-button.component.scss'],
})
export class HamburgerButtonComponent {
  private readonly layoutState = inject(LayoutStateService);

  toggle(): void {
    this.layoutState.toggleSidebar();
  }
}
