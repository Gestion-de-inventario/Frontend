import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';

import {
  AccessibilityService,
  ColorFilter,
  FONT_SCALES,
  Theme,
} from '@core/accessibility/accessibility.service';

/**
 * Menú de accesibilidad.
 *
 * Botón flotante permanente que abre un panel con los ajustes de visualización.
 * Se monta en la raíz de la aplicación, no dentro del armazón autenticado, para
 * que también esté disponible en la pantalla de acceso: quien necesita ampliar
 * el texto lo necesita antes de poder iniciar sesión, no después.
 */
@Component({
  selector: 'app-accessibility-widget',
  standalone: true,
  templateUrl: './accessibility-widget.component.html',
  styleUrl: './accessibility-widget.component.scss',
})
export class AccessibilityWidgetComponent {
  readonly a11y = inject(AccessibilityService);

  readonly open = signal(false);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly scales = FONT_SCALES;

  readonly themes: ReadonlyArray<{ value: Theme; label: string; hint: string }> = [
    { value: 'normal', label: 'Normal', hint: 'Colores originales de la aplicación' },
    { value: 'dark', label: 'Oscuro', hint: 'Fondo oscuro, menos brillo' },
    { value: 'high-contrast', label: 'Alto contraste', hint: 'Máxima separación entre texto y fondo' },
  ];

  readonly filters: ReadonlyArray<{ value: ColorFilter; label: string; hint: string }> = [
    { value: 'none', label: 'Sin filtro', hint: '' },
    { value: 'protanopia', label: 'Protanopía', hint: 'Dificultad con el rojo' },
    { value: 'deuteranopia', label: 'Deuteranopía', hint: 'Dificultad con el verde' },
    { value: 'tritanopia', label: 'Tritanopía', hint: 'Dificultad con el azul' },
  ];

  togglePanel(): void {
    this.open.update((value) => !value);

    if (this.open()) {
      // Se espera al renderizado para poder enfocar el primer control del panel.
      queueMicrotask(() => this.panel()?.nativeElement.focus());
    }
  }

  close(devolverFoco = true): void {
    if (!this.open()) {
      return;
    }

    this.open.set(false);

    // Al cerrar con teclado, el foco debe volver al botón que abrió el panel;
    // de lo contrario se pierde al principio del documento.
    if (devolverFoco) {
      this.trigger().nativeElement.focus();
    }
  }

  porcentaje(scale: number): string {
    return `${Math.round(scale * 100)}%`;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.open()) {
      return;
    }

    const target = event.target as Node;
    const dentroDelPanel = this.panel()?.nativeElement.contains(target);
    const enElBoton = this.trigger().nativeElement.contains(target);

    if (!dentroDelPanel && !enElBoton) {
      this.close(false);
    }
  }

  /**
   * La máscara de lectura sigue al puntero. Se publica la posición como variable
   * CSS en lugar de reposicionar el elemento desde TypeScript, para que el
   * navegador lo resuelva sin recalcular el diseño en cada movimiento.
   */
  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (this.a11y.preferences().readingMask) {
      document.documentElement.style.setProperty('--a11y-mask-y', `${event.clientY}px`);
    }
  }
}
