import { Injectable, signal, computed } from '@angular/core';

export interface UserAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UserSession {
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  address?: UserAddress;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'rg_user_session';

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