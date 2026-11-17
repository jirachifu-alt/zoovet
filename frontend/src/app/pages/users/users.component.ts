import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest, Role, User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { apiErrorMessage } from '../../core/utils/api-error';
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

const EMPTY_USER = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role: 'ROLE_CLIENTE' as Role,
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    FieldErrorComponent,
    ModalComponent
  ],
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
      <form id="user-form" [formGroup]="userForm" (ngSubmit)="save()" novalidate>
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="form-group">
          <label class="form-label" for="user-fullname">Nombre completo *</label>
          <input
            id="user-fullname"
            class="form-input"
            formControlName="fullName"
            placeholder="Ej. Dra. Laura Sánchez"
            autocomplete="name"
            [class.is-invalid]="isInvalid('fullName')"
            [attr.aria-invalid]="isInvalid('fullName')"
          />
          <app-field-error [control]="userForm.controls.fullName" label="El nombre"></app-field-error>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="user-email">Correo electrónico *</label>
            <input
              id="user-email"
              class="form-input"
              type="email"
              formControlName="email"
              placeholder="usuario@zoovet.com"
              autocomplete="email"
              [class.is-invalid]="isInvalid('email')"
              [attr.aria-invalid]="isInvalid('email')"
            />
            <app-field-error [control]="userForm.controls.email" label="El correo"></app-field-error>
          </div>
          <div class="form-group">
            <label class="form-label" for="user-phone">Teléfono</label>
            <input
              id="user-phone"
              class="form-input"
              type="tel"
              formControlName="phone"
              placeholder="+51 999 888 777"
              autocomplete="tel"
              [class.is-invalid]="isInvalid('phone')"
              [attr.aria-invalid]="isInvalid('phone')"
            />
            <app-field-error [control]="userForm.controls.phone" label="El teléfono"></app-field-error>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="user-role">Rol *</label>
            <select
              id="user-role"
              class="form-select"
              formControlName="role"
              [class.is-invalid]="isInvalid('role')"
              [attr.aria-invalid]="isInvalid('role')"
            >
              <option value="ROLE_CLIENTE">Cliente</option>
              <option value="ROLE_VETERINARIO">Veterinario</option>
              <option value="ROLE_ADMIN">Administrador</option>
            </select>
            <app-field-error [control]="userForm.controls.role" label="El rol"></app-field-error>
          </div>
          <div class="form-group">
            <label class="form-label" for="user-password">Contraseña * (mín. 6)</label>
            <input
              id="user-password"
              class="form-input"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="new-password"
              [class.is-invalid]="isInvalid('password')"
              [attr.aria-invalid]="isInvalid('password')"
            />
            <app-field-error [control]="userForm.controls.password" label="La contraseña"></app-field-error>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="user-address">Dirección</label>
          <input
            id="user-address"
            class="form-input"
            formControlName="address"
            placeholder="Av. Principal 123, Miraflores"
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
  private fb = inject(FormBuilder);

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

  userForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[+0-9 ()-]{6,20}$/)]],
    address: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['ROLE_CLIENTE' as Role, [Validators.required]]
  });

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
        this.error = apiErrorMessage(err, 'Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  openCreate(): void {
    this.userForm.reset({ ...EMPTY_USER });
    this.formError = null;
    this.creating = true;
  }

  save(): void {
    this.formError = null;
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) {
      this.formError = 'Revisa los campos marcados en rojo.';
      return;
    }

    this.saving = true;
    const payload: RegisterRequest = this.userForm.getRawValue();
    this.authService.createUser(payload).subscribe({
      next: () => {
        this.saving = false;
        this.creating = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = apiErrorMessage(err, 'Error al crear usuario');
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
