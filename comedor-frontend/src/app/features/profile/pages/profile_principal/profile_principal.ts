import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { ToastService } from '@shared/services/toast.service';
import { EditProfileRequest } from '@features/profile/interfaces/edit-profile.request';
import { ChangePasswordRequest } from '@features/profile/interfaces/change-password.request';
import { EmpresaConfigService } from '@features/profile/services/empresa-config.service';
import { finalize } from 'rxjs';

declare const bootstrap: any;

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { mismatch: true }
    : null;
}

@Component({
  selector: 'app-profile-principal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile_principal.html',
  styleUrl: './profile_principal.scss',
})
export class ProfilePrincipal implements OnInit {
  readonly authState = inject(AuthStateService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly empresaConfigService = inject(EmpresaConfigService); // Inyectamos el servicio

  loadingEdit = signal(false);
  loadingPassword = signal(false);
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  loadingEmpresaConfig = signal(false);
  logoPreview = signal<string | null>(null);
  selectedLogoFile = signal<File | null>(null);
  logoReading = signal(false);

  readonly editForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(8), Validators.maxLength(8)],
    }),
  });

  readonly passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordMatchValidator },
  );

  readonly empresaConfigForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    if (this.authState.hasPermission('EMPRESA_CONFIG_EDIT')) {
      this.loadEmpresaConfig();
    }
  }

  openEditModal(): void {
    const session = this.authState.session();
    this.editForm.patchValue({
      name: session?.name ?? '',
      lastname: session?.lastname ?? '',
      dni: '',
    });
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
  }

  openPasswordModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
  }

  saveEdit(): void {
    if (this.loadingEdit()) return;
    this.loadingEdit.set(true);

    const raw = this.editForm.getRawValue();
    const request: EditProfileRequest = {
      name: raw.name || undefined,
      lastname: raw.lastname || undefined,
      dni: raw.dni || undefined,
    };

    this.userService.editMyProfile(request).subscribe({
      next: (updated) => {
        this.toastService.show('Datos actualizados correctamente', 'success');
        this.authState.updateSession({
          name: updated.name,
          lastname: updated.lastname,
        });
        bootstrap.Modal.getInstance(document.getElementById('editProfileModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('No se pudo actualizar: ' + error.error.message, 'danger');
        this.loadingEdit.set(false);
      },
      complete: () => {
        this.loadingEdit.set(false);
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.loadingPassword()) return;
    this.loadingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    const request: ChangePasswordRequest = { currentPassword, newPassword };

    this.userService.changeMyPassword(request).subscribe({
      next: () => {
        this.toastService.show('Contraseña actualizada correctamente', 'success');
        this.resetPasswordForm();
        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')!)?.hide();
      },
      error: (error) => {
        this.toastService.show('Error: ' + (error.error?.message ?? error.error), 'danger');
        this.loadingPassword.set(false);
      },
      complete: () => {
        this.loadingPassword.set(false);
      },
    });
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.showCurrent.set(false);
    this.showNew.set(false);
    this.showConfirm.set(false);
  }

  // --- MÉTODOS PARA LA CONFIGURACIÓN DE EMPRESA ---

  loadEmpresaConfig(): void {
    this.empresaConfigService.obtener().subscribe({
      next: (config) => {
        this.empresaConfigForm.patchValue({
          nombre: config.nombre || '',
          descripcion: config.descripcion || '',
        });
        // Si ya hay un logo guardado en la BD, lo mostramos en la preview
        if (config.logoBase64) {
          this.logoPreview.set(`data:image/png;base64,${config.logoBase64}`);
        }
      },
      error: () => {
        this.toastService.show('Error al cargar la configuración de la empresa', 'danger');
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      this.toastService.show('Solo se permiten imágenes PNG o JPG', 'warning');
      input.value = '';
      return;
    }

    this.logoReading.set(true);
    this.selectedLogoFile.set(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.logoPreview.set(reader.result as string);
      this.logoReading.set(false);
    };

    reader.onerror = () => {
      this.logoReading.set(false);
      this.selectedLogoFile.set(null);
      this.logoPreview.set(null);
      this.toastService.show('No se pudo leer la imagen seleccionada', 'danger');
    };

    reader.readAsDataURL(file);
  }

  removeLogoPreview(): void {
    this.selectedLogoFile.set(null);
    this.logoPreview.set(null);
  }

  saveEmpresaConfig(): void {
    if (this.empresaConfigForm.invalid || this.loadingEmpresaConfig()) return;
    this.loadingEmpresaConfig.set(true);

    const formData = new FormData();
    formData.append('nombre', this.empresaConfigForm.get('nombre')?.value || '');
    formData.append('descripcion', this.empresaConfigForm.get('descripcion')?.value || '');

    const logo = this.selectedLogoFile();

    if (logo) {
      formData.append('logo', logo);
    }

    this.empresaConfigService
      .actualizar(formData)
      .pipe(
        finalize(() => {
          this.loadingEmpresaConfig.set(false);
        }),
      )
      .subscribe({
        next: (updatedConfig) => {
          this.loadingEmpresaConfig.set(false);

          this.toastService.show('Configuración de la empresa guardada exitosamente', 'success');
          this.selectedLogoFile.set(null);
          if (updatedConfig.logoBase64) {
            this.logoPreview.set(`data:image/png;base64,${updatedConfig.logoBase64}`);
          }
        },
        error: (error) => {
          this.toastService.show(
            'No se pudo guardar la configuración: ' + (error.error?.message || 'Error desconocido'),
            'danger',
          );
          this.loadingEmpresaConfig.set(false);
        },
      });
  }
}
