import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest, Role, User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { iniciales } from '../../core/utils/format';

interface RoleMeta {
  label: string;
  icon: string;
  cls: string;
}

const ROLE_META_MAP: Record<Role, RoleMeta> = {
  ROLE_ADMIN: { label: 'Administrador', icon: 'shield-check', cls: 'role-admin' },
  ROLE_VETERINARIO: { label: 'Veterinario', icon: 'stethoscope', cls: 'role-vet' },
  ROLE_CLIENTE: { label: 'Cliente', icon: 'user', cls: 'role-client' },
};

const EMPTY_USER: RegisterRequest = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role: 'ROLE_CLIENTE',
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Usuarios</h2>
        <p class="page-subtitle">Directorio de cuentas y roles de la plataforma</p>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            class="form-input"
            placeholder="Buscar por nombre o correo…"
            [(ngModel)]="search"
          />
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="16"></app-icon> Nuevo usuario
        </button>
      </div>
    </div>

    <!-- Filtros de tabs de rol -->
    <div class="chip-row">
      <button
        *ngFor="let t of tabs"
        type="button"
        class="chip"
        [class.active]="tab === t.key"
        (click)="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Error alert -->
    <div class="alert alert-error" *ngIf="error">
      {{ error }}
    </div>

    <!-- Skeleton loader -->
    <div class="card skeleton" *ngIf="loading" style="height: 300px;"></div>

    <!-- Empty state -->
    <div class="empty-state card" *ngIf="!loading && filteredUsers.length === 0">
      <span class="empty-ic">
        <app-icon name="users" [size]="26"></app-icon>
      </span>
      <h3>Sin usuarios</h3>
      <p>No hay cuentas que coincidan con la búsqueda.</p>
    </div>

    <!-- Table of users -->
    <div class="table-wrap" *ngIf="!loading && filteredUsers.length > 0">
      <table class="data">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUsers">
            <td>
              <div class="user-cell">
                <span class="avatar avatar-sm">{{ formatInitials(u.fullName) }}</span>
                <strong>{{ u.fullName }}</strong>
              </div>
            </td>
            <td>{{ u.email }}</td>
            <td>
              <ng-container *ngIf="u.phone">{{ u.phone }}</ng-container>
              <span class="muted" *ngIf="!u.phone">—</span>
            </td>
            <td>
              <span class="role-chip" [ngClass]="getRoleMeta(u.role).cls">
                <app-icon [name]="getRoleMeta(u.role).icon" [size]="13"></app-icon>
                {{ getRoleMeta(u.role).label }}
              </span>
            </td>
            <td>
              <span class="badge" [ngClass]="u.active ? 'badge-completed' : 'badge-canceled'">
                {{ u.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear Usuario -->
    <app-modal
      *ngIf="creating"
      title="Nuevo usuario"
      (close)="creating = false"
    >
      <form id="user-form" (ngSubmit)="save()">
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="form-group">
          <label class="form-label">Nombre completo *</label>
          <input
            class="form-input"
            name="fullName"
            placeholder="Ej. Dra. Laura Sánchez"
            [(ngModel)]="form.fullName"
            required
          />
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Correo electrónico *</label>
            <input
              class="form-input"
              type="email"
              name="email"
              placeholder="usuario@zoovet.com"
              [(ngModel)]="form.email"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input
              class="form-input"
              name="phone"
              placeholder="+51 999 888 777"
              [(ngModel)]="form.phone"
            />
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Rol *</label>
            <select class="form-select" name="role" [(ngModel)]="form.role">
              <option value="ROLE_CLIENTE">Cliente</option>
              <option value="ROLE_VETERINARIO">Veterinario</option>
              <option value="ROLE_ADMIN">Administrador</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña * (mín. 6)</label>
            <input
              class="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              [(ngModel)]="form.password"
              minlength="6"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Dirección</label>
          <input
            class="form-input"
            name="address"
            placeholder="Av. Principal 123, Miraflores"
            [(ngModel)]="form.address"
          />
        </div>
      </form>

      <div modal-footer style="display: flex; gap: 10px; justify-content: flex-end; width: 100%;">
        <button type="button" class="btn btn-secondary" (click)="creating = false">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          (click)="save()"
          [disabled]="saving"
        >
          {{ saving ? 'Creando…' : 'Crear usuario' }}
        </button>
      </div>
    </app-modal>
  `
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  tab: string = 'todos';
  tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'ROLE_ADMIN', label: 'Administradores' },
    { key: 'ROLE_VETERINARIO', label: 'Veterinarios' },
    { key: 'ROLE_CLIENTE', label: 'Clientes' },
  ];
  search: string = '';

  creating: boolean = false;
  saving: boolean = false;
  formError: string | null = null;
  form: RegisterRequest = { ...EMPTY_USER };

  get filteredUsers(): User[] {
    const q = this.search.trim().toLowerCase();
    return this.users.filter((u) => {
      const matchTab = this.tab === 'todos' || u.role === this.tab;
      const matchQuery =
        !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.form = { ...EMPTY_USER };
    this.formError = null;
    this.creating = true;
  }

  save(): void {
    this.saving = true;
    this.formError = null;
    this.authService.register(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.creating = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err?.error?.error || err?.message || 'Error al crear usuario';
      }
    });
  }

  getRoleMeta(role: Role): RoleMeta {
    return ROLE_META_MAP[role] || ROLE_META_MAP.ROLE_CLIENTE;
  }

  formatInitials(name?: string): string {
    return iniciales(name || '');
  }
}
