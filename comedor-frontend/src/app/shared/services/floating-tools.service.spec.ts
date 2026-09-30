import { TestBed } from '@angular/core/testing';
import { FloatingToolsService } from './floating-tools.service';

describe('FloatingToolsService', () => {
  let service: FloatingToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FloatingToolsService);
  });

  it('keeps only one floating tool open at a time', () => {
    service.toggle('chatbot');
    expect(service.isOpen('chatbot')).toBe(true);

    service.toggle('accessibility');
    expect(service.isOpen('chatbot')).toBe(false);
    expect(service.isOpen('accessibility')).toBe(true);

    service.toggle('accessibility');
    expect(service.activeTool()).toBeNull();
  });
});
