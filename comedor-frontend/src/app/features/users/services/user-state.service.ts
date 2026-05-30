import { Injectable, signal } from '@angular/core';

import { UserResponse } from '../interfaces/user.response';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly _users = signal<UserResponse[]>([]);

  readonly users = this._users.asReadonly();

  private readonly _selectedUser = signal<UserResponse | null>(null);

  readonly selectedUser = this._selectedUser.asReadonly();

  setUsers(users: UserResponse[]): void {
    this._users.set(users);
  }

  selectUser(user: UserResponse): void {
    this._selectedUser.set(user);
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }

  updateUser(updatedUser: UserResponse): void {
    // LISTA

    this._users.update((users) =>
      users.map((user) => (user.user_id === updatedUser.user_id ? updatedUser : user)),
    );

    // MODAL

    const selectedUser = this._selectedUser();

    if (selectedUser && selectedUser.user_id === updatedUser.user_id) {
      this._selectedUser.set(updatedUser);
    }
  }

  addUser(user: UserResponse): void {
    this._users.update((users) => [user, ...users]);
  }
}
