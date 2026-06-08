import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '@env/environment'; 

@Component({
  selector: 'app-export-report-fragment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './export-report-fragment.component.html',
})
export class ExportReportFragmentComponent implements OnInit {
  private http = inject(HttpClient);

  // --- Estado para "hoy" ---
  todayId = signal<number | null>(null);
  loadingToday = signal(true);
  todayError = signal('');

  selectedDate = signal('');
  dateId = signal<number | null>(null);
  fetchingByDate = signal(false);
  dateError = signal('');

  exporting = signal<'pdf-today' | 'excel-today' | 'pdf-date' | 'excel-date' | null>(null);

  ngOnInit() {
    this.loadTodayReport();
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  }

  private loadTodayReport() {
    this.loadingToday.set(true);
    this.todayError.set('');
    const today = this.getTodayString();

    this.http
      .get<{ id: number }>(`${environment.apiUrl}/menu_report/date/${today}`)
      .subscribe({
        next: (res) => {
          this.todayId.set(res.id);
          this.loadingToday.set(false);
        },
        error: () => {
          this.todayError.set('No hay un reporte generado para hoy.');
          this.loadingToday.set(false);
        },
      });
  }

  onDateChange(value: string) {
    this.selectedDate.set(value);
    this.dateId.set(null);
    this.dateError.set('');

    if (!value) return;

    this.fetchingByDate.set(true);
    this.http
      .get<{ id: number }>(`${environment.apiUrl}/menu_report/date/${value}`)
      .subscribe({
        next: (res) => {
          this.dateId.set(res.id);
          this.fetchingByDate.set(false);
        },
        error: () => {
          this.dateError.set('No se encontró un reporte para esa fecha.');
          this.fetchingByDate.set(false);
        },
      });
  }

  exportToday(format: 'pdf' | 'excel') {
    const id = this.todayId();
    if (!id) return;
    const key = format === 'pdf' ? 'pdf-today' : 'excel-today';
    this.exporting.set(key);
    const url = `${environment.apiUrl}/menu_report/${id}/export/${format}`;
    const filename = `reporte-hoy.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    this.downloadFile(url, filename).finally(() => this.exporting.set(null));
  }

  exportByDate(format: 'pdf' | 'excel') {
    const id = this.dateId();
    if (!id) return;
    const key = format === 'pdf' ? 'pdf-date' : 'excel-date';
    this.exporting.set(key);
    const url = `${environment.apiUrl}/menu_report/${id}/export/${format}`;
    const filename = `reporte-${this.selectedDate()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    this.downloadFile(url, filename).finally(() => this.exporting.set(null));
  }

  private async downloadFile(url: string, filename: string): Promise<void> {
    const blob = await this.http
      .get(url, { responseType: 'blob' })
      .toPromise();
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}