import { Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { UserService } from '@features/users/services/user-api.service';

import { UserStateService } from '../../services/user-state.service';

import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserDetailModalComponent } from '../user-detail-modal/user-detail-modal.component';

declare const bootstrap: any;

@Component({
  selector: 'app-user-list-fragment',

  standalone: true,

  imports: [CommonModule, FormsModule, UserDetailModalComponent],

  templateUrl: './user-list-fragment.component.html',
})
export class UserListFragmentComponent {
  private readonly userService = inject(UserService);

  private readonly userState = inject(UserStateService);

  readonly authState = inject(AuthStateService);

  search = signal('');

  onlyActive = signal(false);

  readonly users = this.userState.users;

  readonly filteredUsers = computed(() => {
    let users = this.users();

    if (this.onlyActive()) {
      users = users.filter((user) => user.status === 'ACTIVE');
    }

    return users.filter((user) => {
      const term = this.search().toLowerCase();

      return (
        user.name.toLowerCase().includes(term) ||
        user.lastname.toLowerCase().includes(term) ||
        user.dni.includes(term)
      );
    });
  });

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.listUsers().subscribe((users) => {
      this.userState.setUsers(users);
    });
  }

  openUser(user: any): void {
    this.userState.selectUser(user);

    const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));

    modal.show();
  }
}
