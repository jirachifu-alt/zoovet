import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { PetService } from '../../core/services/pet.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { MedicalRecord, MedicalRecordCreateDto } from '../../core/models/medical-record.model';
import { Pet } from '../../core/models/pet.model';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { apiErrorMessage } from '../../core/utils/api-error';
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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    FieldErrorComponent,
    ModalComponent,
    ConfirmComponent
  ],
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
      <form id="mr-form" [formGroup]="recordForm" (ngSubmit)="save()" novalidate>
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="mr-pet">Paciente *</label>
            <select
              id="mr-pet"
              class="form-select"
              formControlName="petId"
              [class.is-invalid]="isInvalid('petId')"
              [attr.aria-invalid]="isInvalid('petId')"
            >
              <option [ngValue]="null">Selecciona una mascota</option>
              <option *ngFor="let p of pets" [ngValue]="p.id">
                {{ p.name }} · {{ p.species }} — {{ p.ownerName }}
              </option>
            </select>
            <app-field-error [control]="recordForm.controls.petId" label="El paciente"></app-field-error>
          </div>
          <div class="form-group">
            <label class="form-label" for="mr-vet">Veterinario *</label>
            <select
              id="mr-vet"
              class="form-select"
              formControlName="veterinarianId"
              [class.is-invalid]="isInvalid('veterinarianId')"
              [attr.aria-invalid]="isInvalid('veterinarianId')"
            >
              <option [ngValue]="null">Selecciona</option>
              <option *ngFor="let v of vets" [ngValue]="v.id">
                {{ v.fullName }}
              </option>
            </select>
            <app-field-error [control]="recordForm.controls.veterinarianId" label="El veterinario"></app-field-error>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="mr-date">Fecha y hora *</label>
            <input
              id="mr-date"
              class="form-input"
              type="datetime-local"
              formControlName="date"
              [class.is-invalid]="isInvalid('date')"
              [attr.aria-invalid]="isInvalid('date')"
            />
            <app-field-error [control]="recordForm.controls.date" label="La fecha y hora"></app-field-error>
          </div>
          <div class="form-group">
            <label class="form-label" for="mr-weight">Peso registrado (kg)</label>
            <input
              id="mr-weight"
              class="form-input"
              type="number"
              step="0.1"
              min="0"
              formControlName="recordedWeightKg"
              placeholder="Ej. 12.5"
              [class.is-invalid]="isInvalid('recordedWeightKg')"
              [attr.aria-invalid]="isInvalid('recordedWeightKg')"
            />
            <app-field-error [control]="recordForm.controls.recordedWeightKg" label="El peso"></app-field-error>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="mr-reason">Motivo de la consulta *</label>
          <input
            id="mr-reason"
            class="form-input"
            formControlName="reason"
            placeholder="Ej. Otitis externa leve oído derecho"
            [class.is-invalid]="isInvalid('reason')"
            [attr.aria-invalid]="isInvalid('reason')"
          />
          <app-field-error [control]="recordForm.controls.reason" label="El motivo"></app-field-error>
        </div>

        <div class="form-group">
          <label class="form-label" for="mr-diagnosis">Diagnóstico</label>
          <textarea
            id="mr-diagnosis"
            class="form-textarea"
            rows="2"
            formControlName="diagnosis"
          ></textarea>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="mr-treatment">Tratamiento</label>
            <textarea
              id="mr-treatment"
              class="form-textarea"
              rows="2"
              formControlName="treatment"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="mr-prescription">Receta / indicaciones</label>
            <textarea
              id="mr-prescription"
              class="form-textarea"
              rows="2"
              formControlName="prescription"
            ></textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="mr-notes">Notas adicionales</label>
          <input
            id="mr-notes"
            class="form-input"
            formControlName="notes"
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
  private fb = inject(FormBuilder);

  records: MedicalRecord[] = [];
  pets: Pet[] = [];
  vets: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  search: string = '';

  creating: boolean = false;
  saving: boolean = false;
  formError: string | null = null;

  recordForm = this.fb.nonNullable.group({
    petId: this.fb.control<number | null>(null, [Validators.required]),
    veterinarianId: this.fb.control<number | null>(null, [Validators.required]),
    date: [toLocalInput(new Date()), [Validators.required]],
    reason: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    diagnosis: [''],
    treatment: [''],
    prescription: [''],
    recordedWeightKg: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(500)]),
    notes: ['']
  });

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
        this.error = apiErrorMessage(err, 'Error al cargar historiales clínicos');
        this.loading = false;
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.recordForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  openCreate(): void {
    const user = this.authService.currentUser();
    const defaultVetId = user?.role === 'ROLE_VETERINARIO' ? user.id : this.vets[0]?.id || null;
    this.recordForm.reset({
      ...EMPTY_RECORD,
      date: toLocalInput(new Date()),
      veterinarianId: defaultVetId
    });
    this.formError = null;
    this.creating = true;
  }

  save(): void {
    this.formError = null;
    this.recordForm.markAllAsTouched();
    if (this.recordForm.invalid) {
      this.formError = 'Revisa los campos marcados en rojo.';
      return;
    }

    this.saving = true;
    const raw = this.recordForm.getRawValue();
    const payload: MedicalRecordCreateDto = {
      petId: Number(raw.petId),
      veterinarianId: raw.veterinarianId ? Number(raw.veterinarianId) : null,
      date: raw.date,
      reason: raw.reason.trim(),
      diagnosis: raw.diagnosis.trim() || null,
      treatment: raw.treatment.trim() || null,
      prescription: raw.prescription.trim() || null,
      recordedWeightKg: raw.recordedWeightKg != null ? Number(raw.recordedWeightKg) : null,
      notes: raw.notes.trim() || null,
    };

    this.medicalRecordService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.creating = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = apiErrorMessage(err, 'Error al guardar consulta');
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
        this.error = apiErrorMessage(err, 'Error al eliminar consulta');
        this.toDelete = null;
      }
    });
  }

  formatDate(d?: string): string {
    return fmtDate(d);
  }
}
