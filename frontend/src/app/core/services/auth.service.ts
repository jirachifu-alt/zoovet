import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private tokenSignal = signal<string | null>(this.getInitialToken());
  private currentUserSignal = signal<User | AuthResponse | null>(this.getInitialUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ROLE_ADMIN');
  readonly isVet = computed(() => this.currentUserSignal()?.role === 'ROLE_VETERINARIO');
  readonly isClient = computed(() => this.currentUserSignal()?.role === 'ROLE_CLIENTE');

  private getInitialToken(): string | null {
    return localStorage.getItem('zoovet_token');
  }

  private getInitialUser(): User | AuthResponse | null {
    const raw = localStorage.getItem('zoovet_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  quickLogin(roleType: 'ADMIN' | 'VETERINARIO' | 'CLIENTE'): Observable<AuthResponse> {
    let email = 'cliente@zoovet.com';
    let password = 'cliente123';

    if (roleType === 'ADMIN') {
      email = 'admin@zoovet.com';
      password = 'admin123';
    } else if (roleType === 'VETERINARIO') {
      email = 'vet@zoovet.com';
      password = 'vet123';
    }

    return this.login({ email, password });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem('zoovet_token');
    localStorage.removeItem('zoovet_user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  handleUnauthorized(): void {
    localStorage.removeItem('zoovet_token');
    localStorage.removeItem('zoovet_user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem('zoovet_token', auth.token);
    localStorage.setItem('zoovet_user', JSON.stringify(auth));
    this.tokenSignal.set(auth.token);
    this.currentUserSignal.set(auth);
  }
}
