import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DatabaseService } from '../../core/services/database.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="auth-layout">
      <!-- Panel visual -->
      <aside
        class="auth-visual"
        [style.backgroundImage]="'url(' + heroImage + ')'"
        aria-hidden="true"
      >
        <div class="auth-visual-inner">
          <div class="brand">
            <span class="brand-mark">
              <app-icon name="paw" [size]="20"></app-icon>
            </span>
            <span class="brand-text">
              VetCare <em>Pro</em>
            </span>
          </div>

          <div class="auth-pitch">
            <p class="auth-kicker">Veterinaria & estética animal</p>
            <h2 class="auth-headline">
              El cuidado que
              <em>tu mascota</em>
              merece
            </h2>
            <p class="auth-lead">
              Agenda citas, consulta el historial clínico y mantén el control de las vacunas de
              cada paciente en un solo lugar.
            </p>

            <ul class="auth-bullets">
              <li>
                <span class="bullet-ic green">
                  <app-icon name="calendar-days" [size]="15"></app-icon>
                </span>
                Agenda de citas en línea, 24/7
              </li>
              <li>
                <span class="bullet-ic blue">
                  <app-icon name="file-heart" [size]="15"></app-icon>
                </span>
                Historial médico por paciente
              </li>
              <li>
                <span class="bullet-ic red">
                  <app-icon name="shield-check" [size]="15"></app-icon>
                </span>
                Control de vacunas y recordatorios
              </li>
            </ul>
          </div>

          <small class="auth-copy">© 2026 VetCare Pro · ZooVet</small>
        </div>
      </aside>

      <!-- Panel formulario -->
      <main class="auth-panel">
        <div class="auth-card">
          <h1 class="auth-title">{{ isLogin ? 'Bienvenido' : 'Crea tu cuenta' }}</h1>
          <p class="auth-subtitle">
            {{ isLogin ? 'Ingresa a tu cuenta para continuar.' : 'Regístrate para comenzar a usar la plataforma.' }}
          </p>

          <div class="auth-tabs" role="tablist">
            <button
              type="button"
              class="auth-tab"
              [class.active]="isLogin"
              (click)="setMode('login')"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              class="auth-tab"
              [class.active]="!isLogin"
              (click)="setMode('registro')"
            >
              Crear cuenta
            </button>
          </div>

          <div class="alert alert-error" *ngIf="error">
            <app-icon name="alert-circle" [size]="16"></app-icon> {{ error }}
          </div>
          <div class="alert alert-info" *ngIf="info">
            {{ info }}
          </div>

          <!-- Formulario Login -->
          <form *ngIf="isLogin" (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label class="form-label">Correo electrónico</label>
              <div class="input-icon">
                <app-icon name="mail" [size]="16"></app-icon>
                <input
                  class="form-input"
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  autocomplete="username"
                  [(ngModel)]="loginForm.email"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <div class="form-label-row">
                <label class="form-label">Contraseña</label>
                <button
                  type="button"
                  class="link"
                  (click)="setInfo('Recuperación de contraseña: contacta al administrador de la clínica.')"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div class="input-icon">
                <app-icon name="lock" [size]="16"></app-icon>
                <input
                  class="form-input"
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  [(ngModel)]="loginForm.password"
                  required
                />
                <button
                  type="button"
                  class="input-action"
                  (click)="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></app-icon>
                </button>
              </div>
            </div>

            <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
              {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
            </button>

            <p class="auth-switch">
              ¿No tienes cuenta?
              <button type="button" class="link" (click)="setMode('registro')">
                Regístrate
              </button>
            </p>

            <div class="auth-divider">o continúa con</div>

            <div class="social-row">
              <button
                *ngFor="let p of ['Google', 'Microsoft', 'Apple']"
                type="button"
                class="social-btn"
                (click)="setInfo('Inicio con ' + p + ' disponible próximamente.')"
              >
                <span class="social-dot" [ngClass]="p.toLowerCase()"></span>
                {{ p }}
              </button>
            </div>

            <div class="demo-box">
              <p class="demo-title">Cuentas de prueba</p>
              <div class="demo-row">
                <button
                  *ngFor="let d of demoAccounts"
                  type="button"
                  class="demo-chip"
                  (click)="handleQuickLogin(d.role)"
                  [disabled]="loading"
                >
                  {{ d.label }}
                </button>
              </div>
              <div style="margin-top: 10px; border-top: 1px dashed var(--border-light); padding-top: 8px; text-align: center;">
                <button
                  type="button"
                  class="link"
                  style="font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;"
                  (click)="handleInjectSql()"
                  [disabled]="loading"
                >
                  <app-icon name="database" [size]="13"></app-icon>
                  Inyectar / Restaurar script SQL en MySQL
                </button>
              </div>
            </div>
          </form>

          <!-- Formulario Registro -->
          <form *ngIf="!isLogin" (ngSubmit)="handleRegister()">
            <div class="form-group">
              <label class="form-label">Nombre completo</label>
              <input
                class="form-input"
                name="fullName"
                placeholder="Ej. Ana Morales"
                [(ngModel)]="regForm.fullName"
                required
              />
            </div>

            <div class="field-row">
              <div class="form-group">
                <label class="form-label">Correo electrónico</label>
                <input
                  class="form-input"
                  type="email"
                  name="regEmail"
                  placeholder="tu@correo.com"
                  [(ngModel)]="regForm.email"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input
                  class="form-input"
                  name="phone"
                  placeholder="+51 999 888 777"
                  [(ngModel)]="regForm.phone"
                />
              </div>
            </div>

            <div class="field-row">
              <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input
                  class="form-input"
                  type="password"
                  name="regPassword"
                  placeholder="Mínimo 6 caracteres"
                  [(ngModel)]="regForm.password"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Confirmar contraseña</label>
                <input
                  class="form-input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  [(ngModel)]="regForm.confirm"
                  required
                />
              </div>
            </div>

            <button class="btn btn-primary btn-block" type="submit" [disabled]="loading">
              {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>

            <p class="auth-switch">
              ¿Ya tienes cuenta?
              <button type="button" class="link" (click)="setMode('login')">
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  `
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() mode: 'login' | 'registro' = 'login';

  isLogin: boolean = true;
  showPassword: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  info: string | null = null;

  heroImage = 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1400&q=80';

  demoAccounts: { role: 'ADMIN' | 'VETERINARIO' | 'CLIENTE'; label: string }[] = [
    { role: 'ADMIN', label: 'Admin' },
    { role: 'VETERINARIO', label: 'Veterinario' },
    { role: 'CLIENTE', label: 'Cliente' },
  ];

  loginForm = { email: '', password: '' };
  regForm = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  };

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    this.isLogin = path !== 'registro' && this.mode !== 'registro';
  }

  setMode(mode: 'login' | 'registro'): void {
    this.isLogin = mode === 'login';
    this.error = null;
    this.info = null;
    this.router.navigate([mode === 'login' ? '/login' : '/registro']);
  }

  setInfo(msg: string): void {
    this.info = msg;
  }

  handleLogin(): void {
    this.loading = true;
    this.error = null;
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || err?.error || err?.message || 'Error en inicio de sesión';
      }
    });
  }

  handleRegister(): void {
    this.error = null;
    if (this.regForm.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.regForm.password !== this.regForm.confirm) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    const { confirm, ...payload } = this.regForm;
    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || err?.error || err?.message || 'Error al crear la cuenta';
      }
    });
  }

  handleQuickLogin(role: 'ADMIN' | 'VETERINARIO' | 'CLIENTE'): void {
    this.loading = true;
    this.error = null;
    this.authService.quickLogin(role).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || err?.error || err?.message || 'Error al iniciar sesión rápida';
      }
    });
  }

  handleInjectSql(): void {
    this.loading = true;
    this.error = null;
    this.info = 'Inyectando script SQL en MySQL...';
    this.databaseService.injectSql().subscribe({
      next: (res) => {
        this.loading = false;
        this.info = '¡Base de datos zoovet_db inyectada con éxito! Ya puedes usar las cuentas de prueba.';
      },
      error: (err) => {
        this.loading = false;
        this.info = null;
        this.error = err?.error?.message || err?.message || 'Error al inyectar script SQL.';
      }
    });
  }
}
