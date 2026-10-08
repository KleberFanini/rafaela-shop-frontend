import { Injectable, signal, computed } from '@angular/core';

export interface UserSession {
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'rg_user_session';

  // Lê a sessão do localStorage se existir
  private currentUserSignal = signal<UserSession | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly firstName = computed(() => {
    const user = this.currentUserSignal();
    return user ? user.name.split(' ')[0] : '';
  });

  login(user: UserSession): void {
    this.currentUserSignal.set(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private loadUserFromStorage(): UserSession | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }
}