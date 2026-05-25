import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagApiService } from '@features/categoriesandtags/services/tag-api.service';
import { TagStateService } from '@features/categoriesandtags/services/tag-state.service';
import { ToastService } from '@shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-tag-create-fragment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tag-create-fragment.component.html',
  styleUrl:'./tag-create-fragment.component.scss'
})
export class TagCreateFragmentComponent {
  private readonly tagService = inject(TagApiService);
  private readonly tagState = inject(TagStateService);
  private readonly toastService = inject(ToastService);

  loading = false;

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('createTagModal'));
    modal.show();
  }

  create(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;

    this.tagService.create(this.form.getRawValue()).subscribe({
      next: (created) => {
        this.tagState.addTag(created);
        this.toastService.show('Etiqueta creada correctamente', 'success');
        this.form.reset({ name: '' });
        bootstrap.Modal.getInstance(document.getElementById('createTagModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo crear: ' + error.error.message, 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}