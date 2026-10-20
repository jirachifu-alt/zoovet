import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { PetService } from '../../core/services/pet.service';
import { UserService } from '../../core/services/user.service';
import { Appointment, AppointmentCreateDto, AppointmentStatus } from '../../core/models/appointment.model';
import { Pet } from '../../core/models/pet.model';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { fmtDateTime, toLocalInput } from '../../core/utils/format';
import { STATUS_MAP } from '../dashboard/dashboard.component';

const FILTERS = ['Todas', 'PENDIENTE', 'CONFIRMADA', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA'];

const getNextDayLocal = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return toLocalInput(d);
};

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent, ConfirmComponent],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Citas</h2>
        <p class="page-subtitle">Agenda de atenciones de la clínica</p>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            class="form-input"
            placeholder="Buscar mascota, cliente o motivo…"
            [(ngModel)]="search"
          />
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="16"></app-icon> Nueva cita
        </button>
      </div>
    </div>

    <!-- Filtros de estado con contadores -->
    <div class="chip-row">
      <button
        *ngFor="let f of filters"
        type="button"
        class="chip"
        [class.active]="filter === f"
        (click)="filter = f"
      >
        {{ f === 'Todas' ? 'Todas' : getStatusLabel(f) }}
        <span class="chip-count">{{ counts[f] || 0 }}</span>
      </button>
    </div>

    <!-- Error alert -->
    <div class="alert alert-error" *ngIf="error && !toDelete">
      {{ error }}
    </div>

    <!-- Skeleton loader -->
    <div class="card skeleton" *ngIf="loading" style="height: 320px;"></div>

    <!-- Empty state -->
    <div class="empty-state card" *ngIf="!loading && filteredAppointments.length === 0">
      <span class="empty-ic">
        <app-icon name="calendar-days" [size]="26"></app-icon>
      </span>
      <h3>No hay citas</h3>
      <p>Crea una nueva cita o cambia los filtros de búsqueda.</p>
    </div>

    <!-- Table of appointments -->
    <div class="table-wrap" *ngIf="!loading && filteredAppointments.length > 0">
      <table class="data">
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Paciente</th>
            <th>Cliente</th>
            <th>Veterinario</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of filteredAppointments">
            <td class="cell-strong">{{ formatDateTime(a.dateTime) }}</td>
            <td>
              <strong>{{ a.petName }}</strong>
              <br />
              <small class="muted">{{ a.petSpecies }}</small>
            </td>
            <td>{{ a.clientName || '—' }}</td>
            <td>{{ a.veterinarianName || 'Sin asignar' }}</td>
            <td class="cell-reason">{{ a.reason }}</td>
            <td>
              <span class="badge" [ngClass]="getStatusCls(a.status)">
                {{ getStatusLabel(a.status) }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button
                  *ngIf="a.status === 'PENDIENTE'"
                  type="button"
                  class="btn btn-secondary btn-sm"
                  [disabled]="busyId === a.id"
                  (click)="changeStatus(a.id, 'CONFIRMADA')"
                  title="Confirmar"
                >
                  <app-icon name="check-circle-2" [size]="14"></app-icon> Confirmar
                </button>

                <button
                  *ngIf="a.status === 'CONFIRMADA'"
                  type="button"
                  class="btn btn-secondary btn-sm"
                  [disabled]="busyId === a.id"
                  (click)="changeStatus(a.id, 'EN_ATENCION')"
                  title="Iniciar atención"
                >
                  Atender
                </button>

                <button
                  *ngIf="a.status === 'EN_ATENCION'"
                  type="button"
                  class="btn btn-secondary btn-sm"
                  [disabled]="busyId === a.id"
                  (click)="changeStatus(a.id, 'COMPLETADA')"
                  title="Completar"
                >
                  Completar
                </button>

                <button
                  *ngIf="a.status !== 'CANCELADA' && a.status !== 'COMPLETADA'"
                  type="button"
                  class="btn btn-secondary btn-icon"
                  [disabled]="busyId === a.id"
                  (click)="changeStatus(a.id, 'CANCELADA')"
                  title="Cancelar cita"
                >
                  <app-icon name="x-circle" [size]="15"></app-icon>
                </button>

                <button
                  type="button"
                  class="btn btn-danger btn-icon"
                  (click)="toDelete = a"
                  title="Eliminar"
                >
                  <app-icon name="trash" [size]="15"></app-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nueva Cita -->
    <app-modal
      *ngIf="creating"
      title="Nueva cita"
      (close)="creating = false"
    >
      <form id="appt-form" (ngSubmit)="save()">
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="form-group">
          <label class="form-label">Paciente *</label>
          <select
            class="form-select"
            name="petId"
            [(ngModel)]="form.petId"
            required
          >
            <option [ngValue]="null">Selecciona una mascota</option>
            <option *ngFor="let p of pets" [ngValue]="p.id">
              {{ p.name }} · {{ p.species }} — {{ p.ownerName }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Fecha y hora *</label>
            <input
              class="form-input"
              type="datetime-local"
              name="dateTime"
              [(ngModel)]="form.dateTime"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Veterinario</label>
            <select
              class="form-select"
              name="veterinarianId"
              [(ngModel)]="form.veterinarianId"
            >
              <option [ngValue]="null">Sin asignar</option>
              <option *ngFor="let v of vets" [ngValue]="v.id">
                {{ v.fullName }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Motivo *</label>
          <input
            class="form-input"
            name="reason"
            placeholder="Ej. Control rutinario y desparasitación"
            [(ngModel)]="form.reason"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Notas</label>
          <textarea
            class="form-textarea"
            rows="3"
            name="notes"
            placeholder="Indicaciones para la cita…"
            [(ngModel)]="form.notes"
          ></textarea>
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
          {{ saving ? 'Guardando…' : 'Programar cita' }}
        </button>
      </div>
    </app-modal>

    <!-- Dialogo Confirmar Eliminar -->
    <app-confirm
      [open]="!!toDelete"
      title="Eliminar cita"
      [message]="'¿Deseas eliminar la cita de ' + toDelete?.petName + ' del ' + formatDateTime(toDelete?.dateTime) + '?'"
      [loading]="deleting"
      (confirm)="remove()"
      (cancel)="toDelete = null"
    ></app-confirm>
  `
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private petService = inject(PetService);
  private userService = inject(UserService);

  appointments: Appointment[] = [];
  pets: Pet[] = [];
  vets: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  filter: string = 'Todas';
  filters = FILTERS;
  search: string = '';

  creating: boolean = false;
  saving: boolean = false;
  formError: string | null = null;
  busyId: number | null = null;

  toDelete: Appointment | null = null;
  deleting: boolean = false;

  form: {
    petId: number | null;
    veterinarianId: number | null;
    dateTime: string;
    reason: string;
    notes: string;
  } = {
    petId: null,
    veterinarianId: null,
    dateTime: getNextDayLocal(),
    reason: '',
    notes: ''
  };

  get counts(): Record<string, number> {
    const c: Record<string, number> = { Todas: this.appointments.length };
    this.filters.slice(1).forEach((s) => {
      c[s] = this.appointments.filter((a) => a.status === s).length;
    });
    return c;
  }

  get filteredAppointments(): Appointment[] {
    const q = this.search.trim().toLowerCase();
    return this.appointments.filter((a) => {
      const matchStatus = this.filter === 'Todas' || a.status === this.filter;
      const matchQuery =
        !q ||
        a.petName?.toLowerCase().includes(q) ||
        a.clientName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q) ||
        a.veterinarianName?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }

  ngOnInit(): void {
    this.load();
    this.petService.getAll().subscribe({
      next: (data) => (this.pets = data),
      error: () => (this.pets = [])
    });
    this.userService.getVeterinarians().subscribe({
      next: (data) => (this.vets = data),
      error: () => (this.vets = [])
    });
  }

  load(): void {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        const sorted = [...(data || [])].sort(
          (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );
        this.appointments = sorted;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cargar citas';
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    if (this.pets.length === 0) {
      this.petService.getAll().subscribe({
        next: (data) => {
          this.pets = data || [];
          if (!this.form.petId && this.pets.length > 0) {
            this.form.petId = this.pets[0].id;
          }
        },
        error: () => (this.pets = [])
      });
    }
    if (this.vets.length === 0) {
      this.userService.getVeterinarians().subscribe({
        next: (data) => (this.vets = data || []),
        error: () => (this.vets = [])
      });
    }

    this.form = {
      petId: this.pets.length > 0 ? this.pets[0].id : null,
      veterinarianId: null,
      dateTime: getNextDayLocal(),
      reason: '',
      notes: ''
    };
    this.formError = null;
    this.creating = true;
  }

  save(): void {
    if (!this.form.petId) {
      this.formError = 'Debes seleccionar una mascota.';
      return;
    }
    if (!this.form.dateTime) {
      this.formError = 'Debes especificar una fecha y hora para la cita.';
      return;
    }
    if (!this.form.reason || !this.form.reason.trim()) {
      this.formError = 'Debes ingresar el motivo de la cita.';
      return;
    }

    this.saving = true;
    this.formError = null;

    const selectedPet = this.pets.find((p) => String(p.id) === String(this.form.petId));

    const payload: AppointmentCreateDto = {
      petId: Number(this.form.petId),
      clientId: selectedPet?.ownerId ?? null,
      veterinarianId: this.form.veterinarianId ? Number(this.form.veterinarianId) : null,
      dateTime: this.form.dateTime,
      reason: this.form.reason.trim(),
      notes: this.form.notes ? this.form.notes.trim() : null
    };

    this.appointmentService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.creating = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError =
          err?.error?.error ||
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Error al programar cita';
      }
    });
  }

  changeStatus(id: number, status: AppointmentStatus): void {
    this.busyId = id;
    this.appointmentService.updateStatus(id, status).subscribe({
      next: (updated) => {
        this.appointments = this.appointments.map((a) => (a.id === id ? { ...a, status } : a));
        this.busyId = null;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cambiar estado';
        this.busyId = null;
      }
    });
  }

  remove(): void {
    if (!this.toDelete) return;
    this.deleting = true;
    this.appointmentService.delete(this.toDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.error || err?.message || 'Error al eliminar cita';
        this.toDelete = null;
      }
    });
  }

  getStatusCls(status: string): string {
    return STATUS_MAP[status]?.cls || 'badge-pending';
  }

  getStatusLabel(status: string): string {
    return STATUS_MAP[status]?.label || status;
  }

  formatDateTime(dt?: string): string {
    return fmtDateTime(dt);
  }
}
