import { Injectable, NgZone, inject, signal } from '@angular/core';

/** Tipos mínimos de la Web Speech API (no vienen en las definiciones de TypeScript). */
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export interface DictationCallbacks {
  /** Texto mientras la persona habla (se va corrigiendo). */
  partial: (text: string) => void;
  /** Texto final cuando la persona deja de hablar. */
  final: (text: string) => void;
  /** Mensaje entendible si algo falla. */
  error: (message: string) => void;
}

/**
 * Dictado por voz con la Web Speech API del navegador (gratis, en español).
 * Funciona en Chrome, Edge y Safari; en navegadores sin soporte el botón no se muestra.
 */
@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private readonly zone = inject(NgZone);
  private recognition: SpeechRecognitionLike | null = null;

  readonly listening = signal(false);
  readonly supported: boolean;

  constructor() {
    this.supported = this.constructorFor() !== null;
  }

  start(callbacks: DictationCallbacks): void {
    const Recognition = this.constructorFor();
    if (!Recognition || this.listening()) return;

    const recognition = new Recognition();
    recognition.lang = 'es-PE';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalText = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      this.zone.run(() => callbacks.partial((finalText + interim).trim()));
    };
    recognition.onerror = (event) => {
      this.zone.run(() => callbacks.error(this.describe(event.error)));
    };
    recognition.onend = () => {
      this.zone.run(() => {
        this.listening.set(false);
        this.recognition = null;
        if (finalText.trim()) callbacks.final(finalText.trim());
      });
    };

    this.recognition = recognition;
    this.listening.set(true);
    try {
      recognition.start();
    } catch {
      this.listening.set(false);
      this.recognition = null;
      callbacks.error('No pude activar el micrófono. Inténtalo de nuevo.');
    }
  }

  /** Detiene la escucha; lo dicho hasta ahora se envía igual. */
  stop(): void {
    this.recognition?.stop();
  }

  /** Cancela sin enviar nada (por ejemplo, al cerrar el chat). */
  cancel(): void {
    this.recognition?.abort();
    this.listening.set(false);
    this.recognition = null;
  }

  private describe(code: string): string {
    switch (code) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'El navegador no tiene permiso para usar el micrófono. Tócalo en la barra de direcciones y elige "Permitir".';
      case 'no-speech':
        return 'No te escuché. Toca el micrófono y habla cerca del teléfono o la computadora.';
      case 'audio-capture':
        return 'No encontré un micrófono conectado.';
      case 'network':
        return 'El dictado necesita internet. Revisa tu conexión.';
      case 'aborted':
        return '';
      default:
        return 'No pude entender el audio. Inténtalo de nuevo o escribe tu pregunta.';
    }
  }

  private constructorFor(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }
}
