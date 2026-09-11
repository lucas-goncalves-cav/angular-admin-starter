import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, of, switchMap, tap, throwError } from 'rxjs';
import { AuthSession, AuthenticatedUser, Credentials, UserRole } from '../models';

const STORAGE_KEY = 'admin-starter.session';
const SESSION_DURATION_MS = 60 * 60 * 1000;

interface DemoAccount extends AuthenticatedUser {
  password: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: '1', name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Manager User', email: 'manager@demo.com', password: 'manager123', role: 'manager' },
  { id: '3', name: 'Viewer User', email: 'viewer@demo.com', password: 'viewer123', role: 'viewer' }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly session = signal<AuthSession | null>(this.restoreSession());

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  login(credentials: Credentials): Observable<AuthSession> {
    return of(credentials).pipe(
      delay(600),
      switchMap((value) => {
        const account = DEMO_ACCOUNTS.find(
          (candidate) => candidate.email === value.email.trim().toLowerCase() && candidate.password === value.password
        );

        if (!account) {
          return throwError(() => new Error('Invalid email or password.'));
        }

        const user: AuthenticatedUser = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role
        };

        return of<AuthSession>({
          token: this.createFakeJwt(user),
          expiresAt: Date.now() + SESSION_DURATION_MS,
          user
        });
      }),
      tap((session) => this.persist(session))
    );
  }

  logout(): void {
    this.session.set(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }

    void this.router.navigate(['/login']);
  }

  token(): string | null {
    return this.session()?.token ?? null;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();

    return user !== null && roles.includes(user.role);
  }

  private persist(session: AuthSession): void {
    this.session.set(session);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage failures.
    }
  }

  private restoreSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const session = JSON.parse(raw) as AuthSession;

      return session.expiresAt > Date.now() ? session : null;
    } catch {
      return null;
    }
  }

  /**
   * Builds a structurally valid JWT so the interceptor and the UI can be exercised
   * without a backend. The signature is a placeholder and must never be trusted.
   */
  private createFakeJwt(user: AuthenticatedUser): string {
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');
    const header = encode({ alg: 'HS256', typ: 'JWT' });
    const payload = encode({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor((Date.now() + SESSION_DURATION_MS) / 1000)
    });

    return `${header}.${payload}.demo-signature`;
  }
}
