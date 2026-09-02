import { Injectable, effect, signal } from '@angular/core';

/** Filtros de compensación para las formas más comunes de daltonismo. */
export type ColorFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

/** Tema visual. `high-contrast` va más allá de `dark`: fuerza pares de color por
 *  encima de 7:1 y sustituye las sombras por bordes visibles. */
export type Theme = 'normal' | 'dark' | 'high-contrast';

export interface AccessibilityPreferences {
  /** Multiplicador del tamaño base del texto: 1 = 100%. */
  fontScale: number;
  theme: Theme;
  /** Tipografía de trazos diferenciados, pensada para dislexia y baja visión. */
  legibleFont: boolean;
  lineSpacing: boolean;
  letterSpacing: boolean;
  /** Subraya y enmarca los elementos accionables. */
  highlightLinks: boolean;
  bigCursor: boolean;
  /** Atenúa la página salvo una banda que sigue al puntero. */
  readingMask: boolean;
  reduceMotion: boolean;
  colorFilter: ColorFilter;
}

const DEFAULTS: AccessibilityPreferences = {
  fontScale: 1,
  theme: 'normal',
  legibleFont: false,
  lineSpacing: false,
  letterSpacing: false,
  highlightLinks: false,
  bigCursor: false,
  readingMask: false,
  reduceMotion: false,
  colorFilter: 'none',
};

/** Escalones de tamaño. Se limita a 150%: por encima, las tablas y los
 *  formularios del sistema dejan de caber en un teléfono. */
export const FONT_SCALES = [1, 1.15, 1.3, 1.5] as const;

const STORAGE_KEY = 'comedor.accesibilidad';

/**
 * Preferencias de accesibilidad del usuario.
 *
 * Se guardan en el navegador y se aplican como clases sobre <html>, de forma que
 * cada modo actúa redefiniendo tokens en lugar de reglas de componentes. Por eso
 * son acumulables: se puede combinar alto contraste, tipografía legible e
 * interlineado a la vez sin que ninguno pise a los demás.
 *
 * Las preferencias son por dispositivo y no viajan al servidor: son un ajuste de
 * visualización, no un dato de la persona.
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly _preferences = signal<AccessibilityPreferences>(this.read());

  readonly preferences = this._preferences.asReadonly();

  constructor() {
    // El efecto solo refleja el estado en el DOM; nunca escribe en el
    // almacenamiento. Guardar aquí sería peligroso: si la lectura inicial
    // fallara (modo privado, almacenamiento bloqueado, JSON corrupto), `read`
    // devuelve los valores por defecto y el efecto los grabaría encima,
    // destruyendo los ajustes que el usuario ya tenía guardados.
    // La escritura ocurre solo ante un cambio explícito, en `update`.
    effect(() => this.apply(this._preferences()));
  }

  /** Indica si hay algún ajuste distinto del valor por defecto. */
  get isModified(): boolean {
    const prefs = this._preferences();
    return (Object.keys(DEFAULTS) as (keyof AccessibilityPreferences)[]).some(
      (key) => prefs[key] !== DEFAULTS[key],
    );
  }

  set<K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]): void {
    this.update((prefs) => ({ ...prefs, [key]: value }));
  }

  toggle(
    key: {
      [K in keyof AccessibilityPreferences]: AccessibilityPreferences[K] extends boolean ? K : never;
    }[keyof AccessibilityPreferences],
  ): void {
    this.update((prefs) => ({ ...prefs, [key]: !prefs[key] }));
  }

  /** Avanza al siguiente escalón de tamaño y vuelve al 100% tras el mayor. */
  cycleFontScale(): void {
    this.update((prefs) => {
      const index = FONT_SCALES.indexOf(prefs.fontScale as (typeof FONT_SCALES)[number]);
      return { ...prefs, fontScale: FONT_SCALES[(index + 1) % FONT_SCALES.length] };
    });
  }

  reset(): void {
    this.update(() => ({ ...DEFAULTS }));
  }

  /** Único punto por el que se modifican y se guardan las preferencias. */
  private update(
    cambio: (prefs: AccessibilityPreferences) => AccessibilityPreferences,
  ): void {
    const siguiente = cambio(this._preferences());

    this._preferences.set(siguiente);
    this.persist(siguiente);
  }

  // ---------------------------------------------------------------------------

  private apply(prefs: AccessibilityPreferences): void {
    const root = document.documentElement;

    // Escalar la raíz propaga el cambio a todo lo dimensionado en `rem`,
    // incluidos los componentes de Bootstrap, sin tocar sus estilos.
    root.style.setProperty('--a11y-font-scale', String(prefs.fontScale));

    root.classList.toggle('a11y-dark', prefs.theme === 'dark');
    root.classList.toggle('a11y-high-contrast', prefs.theme === 'high-contrast');
    root.classList.toggle('a11y-legible-font', prefs.legibleFont);
    root.classList.toggle('a11y-line-spacing', prefs.lineSpacing);
    root.classList.toggle('a11y-letter-spacing', prefs.letterSpacing);
    root.classList.toggle('a11y-highlight-links', prefs.highlightLinks);
    root.classList.toggle('a11y-big-cursor', prefs.bigCursor);
    root.classList.toggle('a11y-reduce-motion', prefs.reduceMotion);

    root.classList.remove('a11y-protanopia', 'a11y-deuteranopia', 'a11y-tritanopia');
    if (prefs.colorFilter !== 'none') {
      root.classList.add(`a11y-${prefs.colorFilter}`);
    }
  }

  private read(): AccessibilityPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULTS };
      }

      // Se fusiona con los valores por defecto para que una preferencia guardada
      // por una versión anterior, sin las claves nuevas, siga siendo válida.
      return { ...DEFAULTS, ...(JSON.parse(stored) as Partial<AccessibilityPreferences>) };
    } catch {
      // Modo privado o almacenamiento bloqueado: la aplicación debe seguir
      // funcionando, simplemente sin recordar los ajustes entre visitas.
      return { ...DEFAULTS };
    }
  }

  private persist(prefs: AccessibilityPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Sin persistencia los ajustes siguen activos durante la sesión.
    }
  }
}
