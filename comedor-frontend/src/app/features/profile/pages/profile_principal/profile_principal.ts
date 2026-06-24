import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserService } from '@features/users/services/user-api.service';
import { ToastService } from '@shared/services/toast.service';
import { EditProfileRequest } from '@features/profile/interfaces/edit-profile.request';
import { ChangePasswordRequest } from '@features/profile/interfaces/change-password.request';
import { EmpresaConfigService } from '@features/profile/services/empresa-config.service'; 

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

  loadingEdit = false;
  loadingPassword = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  loadingEmpresaConfig = false;
  logoPreview: string | ArrayBuffer | null = null;
  selectedLogoFile: File | null = null;

  readonly editForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(8), Validators.maxLength(8)],
    }),
  });

  readonly passwordForm = new FormGroup({
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
  }, { validators: passwordMatchValidator });

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
    if (this.loadingEdit) return;
    this.loadingEdit = true;

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
        this.loadingEdit = false;
      },
      complete: () => {
        this.loadingEdit = false;
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.loadingPassword) return;
    this.loadingPassword = true;

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
        this.loadingPassword = false;
      },
      complete: () => {
        this.loadingPassword = false;
      },
    });
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.showCurrent = false;
    this.showNew = false;
    this.showConfirm = false;
  }

  // --- MÉTODOS PARA LA CONFIGURACIÓN DE EMPRESA ---

  loadEmpresaConfig(): void {
    this.empresaConfigService.obtener().subscribe({
      next: (config) => {
        this.empresaConfigForm.patchValue({
          nombre: config.nombre || '',
          descripcion: config.descripcion || ''
        });
        // Si ya hay un logo guardado en la BD, lo mostramos en la preview
        if (config.logoBase64) {
           this.logoPreview = `data:image/png;base64,${config.logoBase64}`;
        }
      },
      error: () => {
        this.toastService.show('Error al cargar la configuración de la empresa', 'danger');
      }
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        this.toastService.show('Solo se permiten imágenes PNG o JPG', 'warning');
        return;
      }
      
      this.selectedLogoFile = file;

      // Generar preview local para el usuario
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  removeLogoPreview(): void {
    this.selectedLogoFile = null;
    this.logoPreview = null;
  }

  saveEmpresaConfig(): void {
    if (this.empresaConfigForm.invalid || this.loadingEmpresaConfig) return;
    this.loadingEmpresaConfig = true;

    const formData = new FormData();
    formData.append('nombre', this.empresaConfigForm.get('nombre')?.value || '');
    formData.append('descripcion', this.empresaConfigForm.get('descripcion')?.value || '');
    
    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }

    this.empresaConfigService.actualizar(formData).subscribe({
      next: (updatedConfig) => {
        this.loadingEmpresaConfig = false;
        
        this.toastService.show('Configuración de la empresa guardada exitosamente', 'success');
        this.selectedLogoFile = null; 
        if (updatedConfig.logoBase64) {
           this.logoPreview = `data:image/png;base64,${updatedConfig.logoBase64}`;
        }
      },
      error: (error) => {
        this.toastService.show('No se pudo guardar la configuración: ' + (error.error?.message || 'Error desconocido'), 'danger');
      },
      complete: () => {
        this.loadingEmpresaConfig = false;
      }
    });
  }
}