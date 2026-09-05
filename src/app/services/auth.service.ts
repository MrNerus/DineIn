import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { ConfigService } from './config.service';

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

interface LoginResponse {
  status: string;
  message?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
  };
}

const USER_STORAGE_KEY = 'savana_cms_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private configService = inject(ConfigService);

  public readonly currentUser = signal<UserProfile | null>(this.getStoredUser());
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isLoading = signal<boolean>(false);
  public readonly authError = signal<string | null>(null);

  constructor() {
    // Sync state on init
    const stored = this.getStoredUser();
    if (stored) {
      this.currentUser.set(stored);
    }
  }

  public login(username: string, password: string): void {
    this.isLoading.set(true);
    this.authError.set(null);

    const payload = { username: username.trim(), password: password.trim() };

    // Try hitting PHP endpoint, with graceful fallback to hardcoded mock for standalone dev
    this.http.post<LoginResponse>(`${this.configService.backend_url}/api/login.php`, payload).pipe(
      catchError((error) => {
        console.warn('Backend endpoint unavailable, evaluating client-side fallback:', error);
        
        // Client-side hardcoded fallback verification
        if (payload.username.toLowerCase() === 'admin' && payload.password === 'admin123') {
          return of<LoginResponse>({
            status: 'success',
            message: 'Login successful (Offline Fallback)',
            token: 'poc-client-token-2026',
            user: {
              id: 1,
              name: 'Savana Admin',
              username: 'admin',
              email: 'admin@savanasushi.pt',
              role: 'admin'
            }
          });
        }
        
        throw new Error('Credenciais inválidas. Utilize admin / admin123 para demonstração.');
      })
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.status === 'success' && res.user && res.token) {
          const user: UserProfile = {
            ...res.user,
            token: res.token
          };
          this.setStoredUser(user);
          this.currentUser.set(user);
          this.authError.set(null);
          this.router.navigate(['/management/overview']);
        } else {
          this.authError.set(res.message || 'Falha ao autenticar.');
        }
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.authError.set(err.message || 'Nome de utilizador ou palavra-passe incorretos.');
      }
    });
  }

  public logout(): void {
    this.clearStoredUser();
    this.currentUser.set(null);
    this.authError.set(null);
    this.router.navigate(['/management/login']);
  }

  private getStoredUser(): UserProfile | null {
    try {
      const stored = sessionStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private setStoredUser(user: UserProfile): void {
    try {
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage restrictions
    }
  }

  private clearStoredUser(): void {
    try {
      sessionStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage restrictions
    }
  }
}

