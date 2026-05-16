import { Injectable } from '@angular/core';
import { StaffLoginResponse } from '../models/api.types';

const STORAGE_KEY = 'iclinic_staff';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

type StoredSession = StaffLoginResponse & {
  expiresAt?: number;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getSession(): StaffLoginResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const session = JSON.parse(raw) as StoredSession;
      if (!session.expiresAt || session.expiresAt <= Date.now()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  setSession(user: StaffLoginResponse): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...user,
        expiresAt: Date.now() + SESSION_TTL_MS,
      }),
    );
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }
}
