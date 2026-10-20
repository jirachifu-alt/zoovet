import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { PetService } from '../../core/services/pet.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { MedicalRecord, MedicalRecordCreateDto } from '../../core/models/medical-record.model';
import { Pet } from '../../core/models/pet.model';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { fmtDate, toLocalInput } from '../../core/utils/format';

const EMPTY_RECORD = {
  petId: null as number | null,
  veterinarianId: null as number | null,
  date: toLocalInput(new Date()),
  reason: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  recordedWeightKg: null as number | null,
  notes: '',
};

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent, ConfirmComponent],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Historial clínico</h2>
        <p class="page-subtitle">
          {{ records.length }} consulta{{ records.length === 1 ? '' : 's' }} registrada{{ records.length === 1 ? '' : 's' }}
        </p>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            class="form-input"
            placeholder="Buscar por paciente, diagnóstico…"
            [(ngModel)]="search"
          />
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="16"></app-icon> Nueva consulta
        </button>
      </div>
    </div>

    <!-- Error alert -->
    <div class="alert alert-error" *ngIf="error && !toDelete">
      {{ error }}
    </div>

    <!-- Skeleton loader -->
    <div class="card skeleton" *ngIf="loading" style="height: 300px;"></div>

    <!-- Empty state -->
    <div class="empty-state card" *ngIf="!loading && filteredRecords.length === 0">
      <span class="empty-ic">
        <app-icon name="stethoscope" [size]="26"></app-icon>
      </span>
      <h3>Sin consultas registradas</h3>
      <p>Registra la primera consulta clínica de un paciente.</p>
    </div>

    <!-- Record cards list -->
    <div class="record-list" *ngIf="!loading && filteredRecords.length > 0">
      <article class="card record-card" *ngFor="let r of filteredRecords">
        <header class="record-head">
          <div>
            <h3>
              {{ r.petName }} <span class="badge badge-species">{{ r.petSpecies }}</span>
            </h3>
            <p class="muted">
              {{ formatDate(r.date) }} · {{ r.veterinarianName || 'Veterinario no asignado' }}
              <ng-container *ngIf="r.ownerName"> · Dueño: {{ r.ownerName }}</ng-container>
            </p>
          </div>
          <button
            type="button"
            class="btn btn-danger btn-icon"
            (click)="toDelete = r"
            title="Eliminar"
          >
            <app-icon name="trash" [size]="15"></app-icon>
          </button>
        </header>

        <div class="record-reason">
          <app-icon name="file-text" [size]="15"></app-icon>
          <span>{{ r.reason }}</span>
        </div>

        <div class="record-grid">
          <div *ngIf="r.diagnosis">
            <h4>Diagnóstico</h4>
            <p>{{ r.diagnosis }}</p>
          </div>
          <div *ngIf="r.treatment">
            <h4>Tratamiento</h4>
            <p>{{ r.treatment }}</p>
          </div>
          <div *ngIf="r.prescription">
            <h4>Indicaciones / receta</h4>
            <p>{{ r.prescription }}</p>
          </div>
        </div>

        <footer class="record-foot">
          <span class="tag" *ngIf="r.recordedWeightKg != null">
            Peso: {{ r.recordedWeightKg }} kg
          </span>
          <span class="tag tag-soft" *ngIf="r.notes">
            {{ r.notes }}
          </span>
        </footer>
      </article>
    </div>

    <!-- Modal Nueva Consulta -->
    <app-modal
      *ngIf="creating"
      title="Nueva consulta"
      [width]="720"
      (close)="creating = false"
    >
      <form id="mr-form" (ngSubmit)="save()">
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="field-row">
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
          <div class="form-group">
            <label class="form-label">Veterinario *</label>
            <select
              class="form-select"
              name="veterinarianId"
              [(ngModel)]="form.veterinarianId"
              required
            >
              <option [ngValue]="null">Selecciona</option>
              <option *ngFor="let v of vets" [ngValue]="v.id">
                {{ v.fullName }}
              </option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Fecha y hora *</label>
            <input
              class="form-input"
              type="datetime-local"
              name="date"
              [(ngModel)]="form.date"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Peso registrado (kg)</label>
            <input
              class="form-input"
              type="number"
              step="0.1"
              min="0"
              name="recordedWeight"
              placeholder="Ej. 12.5"
              [(ngModel)]="form.recordedWeightKg"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Motivo de la consulta *</label>
          <input
            class="form-input"
            name="reason"
            placeholder="Ej. Otitis externa leve oído derecho"
            [(ngModel)]="form.reason"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Diagnóstico</label>
          <textarea
            class="form-textarea"
            rows="2"
            name="diagnosis"
            [(ngModel)]="form.diagnosis"
          ></textarea>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Tratamiento</label>
            <textarea
              class="form-textarea"
              rows="2"
              name="treatment"
              [(ngModel)]="form.treatment"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Receta / indicaciones</label>
            <textarea
              class="form-textarea"
              rows="2"
              name="prescription"
              [(ngModel)]="form.prescription"
            ></textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notas adicionales</label>
          <input
            class="form-input"
            name="notes"
            [(ngModel)]="form.notes"
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
          {{ saving ? 'Guardando…' : 'Guardar consulta' }}
        </button>
      </div>
    </app-modal>

    <!-- Dialogo Confirmar Eliminar -->
    <app-confirm
      [open]="!!toDelete"
      title="Eliminar consulta"
      [message]="'¿Deseas eliminar el registro de ' + toDelete?.petName + ' del ' + formatDate(toDelete?.date) + '?'"
      [loading]="deleting"
      (confirm)="remove()"
      (cancel)="toDelete = null"
    ></app-confirm>
  `
})
export class MedicalRecordsComponent implements OnInit {
  private medicalRecordService = inject(MedicalRecordService);
  private petService = inject(PetService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  records: MedicalRecord[] = [];
  pets: Pet[] = [];
  vets: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  search: string = '';

  creating: boolean = false;
  saving: boolean = false;
  formError: string | null = null;
  form = { ...EMPTY_RECORD };

  toDelete: MedicalRecord | null = null;
  deleting: boolean = false;

  get filteredRecords(): MedicalRecord[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.records;
    return this.records.filter(
      (r) =>
        r.petName?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.diagnosis?.toLowerCase().includes(q) ||
        r.veterinarianName?.toLowerCase().includes(q)
    );
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
    this.medicalRecordService.getAll().subscribe({
      next: (data) => {
        const sorted = [...(data || [])].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.records = sorted;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cargar historiales clínicos';
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    const user = this.authService.currentUser();
    const defaultVetId = user?.role === 'ROLE_VETERINARIO' ? user.id : this.vets[0]?.id || null;
    this.form = {
      ...EMPTY_RECORD,
      date: toLocalInput(new Date()),
      veterinarianId: defaultVetId
    };
    this.formError = null;
    this.creating = true;
  }

  save(): void {
    if (!this.form.petId) {
      this.formError = 'Selecciona una mascota.';
      return;
    }
    this.saving = true;
    this.formError = null;

    const payload: MedicalRecordCreateDto = {
      petId: Number(this.form.petId),
      veterinarianId: this.form.veterinarianId ? Number(this.form.veterinarianId) : null,
      date: this.form.date,
      reason: this.form.reason,
      diagnosis: this.form.diagnosis || null,
      treatment: this.form.treatment || null,
      prescription: this.form.prescription || null,
      recordedWeightKg: this.form.recordedWeightKg != null ? Number(this.form.recordedWeightKg) : null,
      notes: this.form.notes || null,
    };

    this.medicalRecordService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.creating = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err?.error?.error || err?.message || 'Error al guardar consulta';
      }
    });
  }

  remove(): void {
    if (!this.toDelete) return;
    this.deleting = true;
    this.medicalRecordService.delete(this.toDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.error || err?.message || 'Error al eliminar consulta';
        this.toDelete = null;
      }
    });
  }

  formatDate(d?: string): string {
    return fmtDate(d);
  }
}
