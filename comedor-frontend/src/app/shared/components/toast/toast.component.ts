import { Component, inject } from '@angular/core';

import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-toast',

  standalone: true,

  templateUrl: './toast.component.html',

  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
