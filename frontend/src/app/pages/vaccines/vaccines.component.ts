import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VaccineService } from '../../core/services/vaccine.service';
import { PetService } from '../../core/services/pet.service';
import { UserService } from '../../core/services/user.service';
import { VaccineRecord, VaccineRecordCreateDto } from '../../core/models/vaccine.model';
import { Pet } from '../../core/models/pet.model';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { fmtDate } from '../../core/utils/format';

type VaccineStatusType = 'vigente' | 'por-vencer' | 'vencida';

const EMPTY_VACCINE = {
  petId: null as number | null,
  vaccineName: '',
  applicationDate: new Date().toISOString().slice(0, 10),
  nextDueDate: '',
  veterinarianId: null as number | null,
  batchNumber: '',
  notes: '',
};

@Component({
  selector: 'app-vaccines',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent, ConfirmComponent],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Vacunación</h2>
        <p class="page-subtitle">Control de inmunizaciones y refuerzos pendientes</p>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            class="form-input"
            placeholder="Buscar vacuna, paciente o lote…"
            [(ngModel)]="search"
          />
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="16"></app-icon> Registrar vacuna
        </button>
      </div>
    </div>

    <!-- Filtros de estado -->
    <div class="chip-row">
      <button
        *ngFor="let f of filters"
        type="button"
        class="chip"
        [class.active]="filter === f.key"
        (click)="filter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Error alert -->
    <div class="alert alert-error" *ngIf="error && !toDelete">
      {{ error }}
    </div>

    <!-- Skeleton loader -->
    <div class="card skeleton" *ngIf="loading" style="height: 300px;"></div>

    <!-- Empty state -->
    <div class="empty-state card" *ngIf="!loading && filteredVaccines.length === 0">
      <span class="empty-ic">
        <app-icon name="syringe" [size]="26"></app-icon>
      </span>
      <h3>Sin vacunas registradas</h3>
      <p>Registra la primera vacuna de un paciente.</p>
    </div>

    <!-- Table of vaccines -->
    <div class="table-wrap" *ngIf="!loading && filteredVaccines.length > 0">
      <table class="data">
        <thead>
          <tr>
            <th>Vacuna</th>
            <th>Paciente</th>
            <th>Aplicada</th>
            <th>Próximo refuerzo</th>
            <th>Lote</th>
            <th>Estado</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of filteredVaccines">
            <td class="cell-strong">{{ v.vaccineName }}</td>
            <td>
              <strong>{{ v.petName }}</strong>
              <br />
              <small class="muted">{{ v.petSpecies }}</small>
            </td>
            <td>{{ formatDate(v.applicationDate) }}</td>
            <td>{{ formatDate(v.nextDueDate) }}</td>
            <td>
              <span class="tag">{{ v.batchNumber || '—' }}</span>
            </td>
            <td>
              <span
                class="badge"
                [ngClass]="{
                  'badge-canceled': getVaccineStatus(v) === 'vencida',
                  'badge-pending': getVaccineStatus(v) === 'por-vencer',
                  'badge-completed': getVaccineStatus(v) === 'vigente'
                }"
              >
                <app-icon
                  *ngIf="getVaccineStatus(v) === 'vencida'"
                  name="alert-triangle"
                  [size]="12"
                ></app-icon>
                {{ getStatusLabel(getVaccineStatus(v)) }}
              </span>
            </td>
            <td>
              <div class="row-actions" style="justify-content: flex-end;">
                <button
                  type="button"
                  class="btn btn-danger btn-icon"
                  (click)="toDelete = v"
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

    <!-- Modal Registrar Vacuna -->
    <app-modal
      *ngIf="creating"
      title="Registrar vacuna"
      (close)="creating = false"
    >
      <form id="vac-form" (ngSubmit)="save()">
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
            <label class="form-label">Nombre de la vacuna *</label>
            <input
              class="form-input"
              list="vaccines-list"
              name="vaccineName"
              placeholder="Ej. Antirrábica"
              [(ngModel)]="form.vaccineName"
              required
            />
            <datalist id="vaccines-list">
              <option *ngFor="let opt of defaultVaccineNames" [value]="opt"></option>
            </datalist>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Fecha de aplicación *</label>
            <input
              class="form-input"
              type="date"
              name="applicationDate"
              [(ngModel)]="form.applicationDate"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Próximo refuerzo</label>
            <input
              class="form-input"
              type="date"
              name="nextDueDate"
              [(ngModel)]="form.nextDueDate"
            />
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Veterinario</label>
            <select
              class="form-select"
              name="veterinarianId"
              [(ngModel)]="form.veterinarianId"
            >
              <option [ngValue]="null">Selecciona</option>
              <option *ngFor="let v of vets" [ngValue]="v.id">
                {{ v.fullName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">N° de lote</label>
            <input
              class="form-input"
              name="batchNumber"
              placeholder="Ej. VAC-2026-X88"
              [(ngModel)]="form.batchNumber"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notas</label>
          <textarea
            class="form-textarea"
            rows="2"
            name="notes"
            placeholder="Reacciones adversas, observaciones…"
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
          {{ saving ? 'Guardando…' : 'Registrar' }}
        </button>
      </div>
    </app-modal>

    <!-- Dialogo Confirmar Eliminar -->
    <app-confirm
      [open]="!!toDelete"
      title="Eliminar registro"
      [message]="'¿Deseas eliminar la vacuna ' + toDelete?.vaccineName + ' de ' + toDelete?.petName + '?'"
      [loading]="deleting"
      (confirm)="remove()"
      (cancel)="toDelete = null"
    ></app-confirm>
  `
})
export class VaccinesComponent implements OnInit {
  private vaccineService = inject(VaccineService);
  private petService = inject(PetService);
  private userService = inject(UserService);

  vaccines: VaccineRecord[] = [];
  pets: Pet[] = [];
  vets: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  filter: string = 'todas';
  filters = [
    { key: 'todas', label: 'Todas' },
    { key: 'vigente', label: 'Vigentes' },
    { key: 'por-vencer', label: 'Por vencer' },
    { key: 'vencida', label: 'Vencidas' },
  ];
  search: string = '';

  defaultVaccineNames = [
    'Antirrábica',
    'Séxtuple Canina (DHPPi+L)',
    'Triple Felina (FVRCP)',
    'Quíntuple Felina',
    'Bordetella',
    'Leishmaniasis',
    'Gripe canina',
  ];

  creating: boolean = false;
  saving: boolean = false;
  formError: string | null = null;
  form = { ...EMPTY_VACCINE };

  toDelete: VaccineRecord | null = null;
  deleting: boolean = false;

  get filteredVaccines(): VaccineRecord[] {
    const q = this.search.trim().toLowerCase();
    return this.vaccines.filter((v) => {
      const st = this.getVaccineStatus(v);
      const matchFilter = this.filter === 'todas' || st === this.filter;
      const matchQuery =
        !q ||
        v.vaccineName?.toLowerCase().includes(q) ||
        v.petName?.toLowerCase().includes(q) ||
        v.batchNumber?.toLowerCase().includes(q);
      return matchFilter && matchQuery;
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
    this.vaccineService.getAll().subscribe({
      next: (data) => {
        const sorted = [...(data || [])].sort(
          (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
        );
        this.vaccines = sorted;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cargar vacunas';
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.form = {
      ...EMPTY_VACCINE,
      applicationDate: new Date().toISOString().slice(0, 10),
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

    const payload: VaccineRecordCreateDto = {
      petId: Number(this.form.petId),
      vaccineName: this.form.vaccineName,
      applicationDate: this.form.applicationDate,
      nextDueDate: this.form.nextDueDate || null,
      veterinarianId: this.form.veterinarianId ? Number(this.form.veterinarianId) : null,
      batchNumber: this.form.batchNumber || null,
      notes: this.form.notes || null,
    };

    this.vaccineService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.creating = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err?.error?.error || err?.message || 'Error al registrar vacuna';
      }
    });
  }

  remove(): void {
    if (!this.toDelete) return;
    this.deleting = true;
    this.vaccineService.delete(this.toDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.error || err?.message || 'Error al eliminar vacuna';
        this.toDelete = null;
      }
    });
  }

  getVaccineStatus(v: VaccineRecord): VaccineStatusType {
    if (!v.nextDueDate) return 'vigente';
    const now = new Date();
    const due = new Date(v.nextDueDate);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'vencida';
    if (diff <= 30) return 'por-vencer';
    return 'vigente';
  }

  getStatusLabel(st: VaccineStatusType): string {
    switch (st) {
      case 'vigente':
        return 'Vigente';
      case 'por-vencer':
        return 'Por vencer';
      case 'vencida':
        return 'Vencida';
    }
  }

  formatDate(d?: string): string {
    return fmtDate(d);
  }
}
