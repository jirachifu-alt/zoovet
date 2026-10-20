import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { DatabaseService } from '../core/services/database.service';
import { DatabaseOperationResponse } from '../core/models/database.model';
import { IconComponent } from '../shared/components/icon/icon.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { iniciales } from '../core/utils/format';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: string[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const ROLE_LABEL: Record<string, string> = {
  ROLE_ADMIN: 'Administrador',
  ROLE_VETERINARIO: 'Veterinario',
  ROLE_CLIENTE: 'Cliente',
};

const TITLES: Record<string, string> = {
  '/dashboard': 'Panel general',
  '/mascotas': 'Pacientes',
  '/citas': 'Citas',
  '/historial': 'Historial clínico',
  '/vacunas': 'Vacunación',
  '/usuarios': 'Usuarios',
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ModalComponent],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-brand">
          <span class="brand-mark">
            <app-icon name="paw" [size]="20"></app-icon>
          </span>
          <span class="brand-text">
            VetCare <em>Pro</em>
          </span>
          <button
            type="button"
            class="sidebar-close"
            (click)="setSidebar(false)"
            aria-label="Cerrar menú"
          >
            <app-icon name="x" [size]="18"></app-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ng-container *ngFor="let group of visibleNavGroups()">
            <div *ngIf="group.items.length > 0">
              <p class="nav-section">{{ group.section }}</p>
              <a
                *ngFor="let item of group.items"
                [routerLink]="item.to"
                routerLinkActive="active"
                class="nav-item"
                (click)="setSidebar(false)"
              >
                <app-icon [name]="item.icon" [size]="18"></app-icon>
                <span>{{ item.label }}</span>
              </a>
            </div>
          </ng-container>
        </nav>

        <div class="user-card" *ngIf="currentUser(); let user">
          <span class="avatar">{{ userInitials() }}</span>
          <div class="user-card-info">
            <strong>{{ user.fullName }}</strong>
            <small>{{ roleLabel() }}</small>
          </div>
          <button
            type="button"
            class="btn btn-secondary btn-icon"
            (click)="logout()"
            title="Cerrar sesión"
          >
            <app-icon name="logout" [size]="16"></app-icon>
          </button>
        </div>
      </aside>

      <!-- Mobile backdrop -->
      <div
        *ngIf="sidebarOpen()"
        class="sidebar-backdrop"
        (click)="setSidebar(false)"
      ></div>

      <!-- Main container -->
      <div class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <button
              type="button"
              class="btn btn-secondary btn-icon topbar-menu"
              (click)="setSidebar(true)"
              aria-label="Abrir menú"
            >
              <app-icon name="menu" [size]="18"></app-icon>
            </button>
            <div>
              <h1>{{ currentTitle() }}</h1>
              <p class="topbar-sub">Veterinaria & estética animal · ZooVet</p>
            </div>
          </div>

          <div class="topbar-right" *ngIf="currentUser(); let user">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              (click)="openDbModal()"
              title="Inyectar / Restaurar script SQL en MySQL"
            >
              <app-icon name="database" [size]="15"></app-icon> Base de Datos SQL
            </button>
            <button type="button" class="btn btn-secondary btn-icon" title="Notificaciones">
              <app-icon name="bell" [size]="17"></app-icon>
            </button>
            <span class="role-chip">{{ roleLabel() }}</span>
            <span class="avatar">{{ userInitials() }}</span>
          </div>
        </header>

        <main class="page-container">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Modal Base de Datos SQL -->
      <app-modal
        *ngIf="dbModalOpen()"
        title="Inyección de Base de Datos MySQL (APF2)"
        [width]="580"
        (close)="dbModalOpen.set(false)"
      >
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.95rem; color: var(--text-secondary);">
            Este servicio ejecuta e inyecta el script SQL <code>zoovet_completo_con_datos.sql</code> directamente en tu servidor <strong>MySQL</strong> (base de datos <code>zoovet_db</code>).
          </p>

          <div class="alert alert-info" style="margin: 0;">
            <strong>Script SQL:</strong> database/zoovet_completo_con_datos.sql<br>
            <strong>Destino:</strong> MySQL localhost:3306 (zoovet_db)
          </div>

          <div *ngIf="dbStatus()" class="card" style="padding: 14px; background: var(--bg-card-subtle);">
            <h4 style="margin-bottom: 8px; font-size: 0.9rem;">Registros actuales en MySQL:</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.85rem;">
              <div>Usuarios: <strong>{{ dbStatus()?.totalUsers }}</strong></div>
              <div>Mascotas: <strong>{{ dbStatus()?.totalPets }}</strong></div>
              <div>Citas: <strong>{{ dbStatus()?.totalAppointments }}</strong></div>
              <div>Consultas: <strong>{{ dbStatus()?.totalMedicalRecords }}</strong></div>
              <div>Vacunas: <strong>{{ dbStatus()?.totalVaccines }}</strong></div>
            </div>
          </div>

          <div class="alert alert-error" *ngIf="dbError()">
            {{ dbError() }}
          </div>

          <div class="alert alert-info" *ngIf="dbMessage()" style="background: #D1FAE5; color: #065F46; border-color: #A7F3D0;">
            {{ dbMessage() }}
          </div>
        </div>

        <div modal-footer style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <button type="button" class="btn btn-secondary" (click)="dbModalOpen.set(false)">
            Cerrar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="executeSeed()"
            [disabled]="dbLoading()"
          >
            <app-icon name="database" [size]="16"></app-icon>
            {{ dbLoading() ? 'Inyectando SQL en MySQL…' : 'Inyectar / Restaurar Datos' }}
          </button>
        </div>
      </app-modal>
    </div>
  `
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private databaseService = inject(DatabaseService);
  private router = inject(Router);

  dbModalOpen = signal<boolean>(false);
  dbLoading = signal<boolean>(false);
  dbStatus = signal<DatabaseOperationResponse | null>(null);
  dbMessage = signal<string | null>(null);
  dbError = signal<string | null>(null);

  sidebarOpen = signal<boolean>(false);
  currentPath = signal<string>(this.router.url);

  currentUser = this.authService.currentUser;

  userInitials = computed(() => {
    return iniciales(this.currentUser()?.fullName || '');
  });

  roleLabel = computed(() => {
    const role = this.currentUser()?.role;
    return (role && ROLE_LABEL[role]) || 'Usuario';
  });

  currentTitle = computed(() => {
    const path = this.currentPath().split('?')[0];
    return TITLES[path] || 'VetCare Pro';
  });

  navGroups: NavSection[] = [
    {
      section: 'General',
      items: [
        { to: '/dashboard', label: 'Panel', icon: 'dashboard' },
        { to: '/mascotas', label: 'Mascotas', icon: 'paw' },
        { to: '/citas', label: 'Citas', icon: 'calendar-days' },
      ],
    },
    {
      section: 'Atención clínica',
      items: [
        { to: '/historial', label: 'Historial clínico', icon: 'stethoscope' },
        { to: '/vacunas', label: 'Vacunación', icon: 'syringe' },
      ],
    },
    {
      section: 'Administración',
      items: [
        { to: '/usuarios', label: 'Usuarios', icon: 'users', roles: ['ROLE_ADMIN'] },
      ],
    },
  ];

  visibleNavGroups = computed(() => {
    const role = this.currentUser()?.role;
    return this.navGroups.map((g) => ({
      section: g.section,
      items: g.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    }));
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentPath.set(event.urlAfterRedirects);
        this.sidebarOpen.set(false);
      });
  }

  setSidebar(state: boolean): void {
    this.sidebarOpen.set(state);
  }

  openDbModal(): void {
    this.dbModalOpen.set(true);
    this.dbMessage.set(null);
    this.dbError.set(null);
    this.databaseService.getStatus().subscribe({
      next: (status) => this.dbStatus.set(status),
      error: (err) => console.warn('No se pudo obtener el estado inicial de la BD:', err)
    });
  }

  executeSeed(): void {
    this.dbLoading.set(true);
    this.dbMessage.set(null);
    this.dbError.set(null);
    this.databaseService.injectSql().subscribe({
      next: (res) => {
        this.dbLoading.set(false);
        this.dbStatus.set(res);
        this.dbMessage.set('¡Base de datos zoovet_db inyectada y poblada exitosamente en MySQL!');
      },
      error: (err) => {
        this.dbLoading.set(false);
        this.dbError.set(err?.error?.message || err?.message || 'Error al inyectar script SQL.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
