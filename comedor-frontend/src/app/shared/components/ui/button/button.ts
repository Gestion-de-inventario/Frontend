import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class ButtonComponent {
  @Input() disabled = false;

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Input() ariaLabel = '';
}
