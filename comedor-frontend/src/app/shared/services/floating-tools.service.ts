import { Injectable, signal } from '@angular/core';

export type FloatingTool = 'chatbot' | 'accessibility';

@Injectable({ providedIn: 'root' })
export class FloatingToolsService {
  readonly activeTool = signal<FloatingTool | null>(null);

  isOpen(tool: FloatingTool): boolean {
    return this.activeTool() === tool;
  }

  toggle(tool: FloatingTool): void {
    this.activeTool.update((active) => (active === tool ? null : tool));
  }

  close(tool: FloatingTool): void {
    if (this.activeTool() === tool) {
      this.activeTool.set(null);
    }
  }
}
