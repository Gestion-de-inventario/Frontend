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

  updateUser(updated: UserResponse): void {
    this._users.update((users) =>
      users.map((user) => (user.user_id === updated.user_id ? updated : user)),
    );
  }

  addUser(user: UserResponse): void {
    this._users.update((users) => [user, ...users]);
  }
}
