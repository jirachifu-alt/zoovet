import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetService } from '../../core/services/pet.service';
import { UserService } from '../../core/services/user.service';
import { Pet, PetCreateOrUpdateDto } from '../../core/models/pet.model';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { edad, iniciales, PLACEHOLDER_PET } from '../../core/utils/format';

const EMPTY_PET: PetCreateOrUpdateDto = {
  name: '',
  species: 'Perro',
  breed: '',
  gender: 'Macho',
  birthDate: '',
  weightKg: null,
  color: '',
  photoUrl: '',
  notes: '',
  ownerId: null,
};

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent, ConfirmComponent],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Mascotas</h2>
        <p class="page-subtitle">
          {{ pets.length }} paciente{{ pets.length === 1 ? '' : 's' }} en la clínica
        </p>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            class="form-input"
            placeholder="Buscar por nombre, raza o dueño…"
            [(ngModel)]="search"
          />
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="16"></app-icon> Nueva mascota
        </button>
      </div>
    </div>

    <!-- Filtro de especies -->
    <div class="chip-row">
      <button
        *ngFor="let s of speciesList"
        type="button"
        class="chip"
        [class.active]="selectedSpecies === s"
        (click)="selectedSpecies = s"
      >
        {{ s }}
      </button>
    </div>

    <!-- Error alert -->
    <div class="alert alert-error" *ngIf="error && !toDelete">
      {{ error }}
    </div>

    <!-- Loading Skeleton -->
    <div class="grid-cards" *ngIf="loading">
      <div class="card skeleton" *ngFor="let i of [1, 2, 3, 4, 5, 6]" style="height: 300px;"></div>
    </div>

    <!-- Empty state -->
    <div class="empty-state card" *ngIf="!loading && filteredPets.length === 0">
      <span class="empty-ic">
        <app-icon name="paw" [size]="26"></app-icon>
      </span>
      <h3>Sin resultados</h3>
      <p>No encontramos mascotas con ese criterio. Registra una nueva para comenzar.</p>
      <button type="button" class="btn btn-primary" (click)="openCreate()">
        <app-icon name="plus" [size]="16"></app-icon> Nueva mascota
      </button>
    </div>

    <!-- Pet Grid Cards -->
    <div class="grid-cards" *ngIf="!loading && filteredPets.length > 0">
      <article class="card pet-card card-hover" *ngFor="let pet of filteredPets">
        <div class="pet-photo">
          <img
            [src]="pet.photoUrl || placeholderPet"
            [alt]="pet.name"
            (error)="onImgError($event)"
          />
          <span class="badge badge-species">{{ pet.species }}</span>
          <div class="pet-actions">
            <button
              type="button"
              class="btn btn-secondary btn-icon"
              (click)="openEdit(pet)"
              title="Editar"
            >
              <app-icon name="pencil" [size]="15"></app-icon>
            </button>
            <button
              type="button"
              class="btn btn-danger btn-icon"
              (click)="toDelete = pet"
              title="Eliminar"
            >
              <app-icon name="trash" [size]="15"></app-icon>
            </button>
          </div>
        </div>

        <div class="pet-body">
          <h3>{{ pet.name }}</h3>
          <p class="pet-breed">
            {{ pet.breed || 'Raza no especificada' }} · {{ pet.gender || '—' }}
          </p>

          <dl class="pet-meta">
            <div>
              <dt>Edad</dt>
              <dd>{{ formatEdad(pet.birthDate) }}</dd>
            </div>
            <div>
              <dt>Peso</dt>
              <dd>{{ pet.weightKg ? pet.weightKg + ' kg' : '—' }}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>{{ pet.color || '—' }}</dd>
            </div>
          </dl>

          <div class="pet-owner">
            <span class="avatar avatar-sm">{{ formatInitials(pet.ownerName) }}</span>
            <div>
              <strong>{{ pet.ownerName || 'Sin propietario' }}</strong>
              <small>{{ pet.ownerPhone || pet.ownerEmail || 'Sin contacto' }}</small>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Modal Crear / Editar -->
    <app-modal
      *ngIf="editing"
      [title]="editing === 'new' ? 'Nueva mascota' : 'Editar ' + form.name"
      (close)="editing = null"
    >
      <form id="pet-form" (ngSubmit)="save()">
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input
              class="form-input"
              name="petName"
              [(ngModel)]="form.name"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Especie *</label>
            <select
              class="form-select"
              name="petSpecies"
              [(ngModel)]="form.species"
              required
            >
              <option *ngFor="let s of standardSpecies" [value]="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Raza</label>
            <input
              class="form-input"
              name="petBreed"
              placeholder="Ej. Golden Retriever"
              [(ngModel)]="form.breed"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Sexo</label>
            <select class="form-select" name="petGender" [(ngModel)]="form.gender">
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Fecha de nacimiento</label>
            <input
              class="form-input"
              type="date"
              name="petBirthDate"
              [(ngModel)]="form.birthDate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Peso (kg)</label>
            <input
              class="form-input"
              type="number"
              step="0.1"
              min="0"
              name="petWeight"
              placeholder="Ej. 12.5"
              [(ngModel)]="form.weightKg"
            />
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label">Color</label>
            <input
              class="form-input"
              name="petColor"
              placeholder="Ej. Dorado"
              [(ngModel)]="form.color"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Propietario *</label>
            <select
              class="form-select"
              name="petOwnerId"
              [(ngModel)]="form.ownerId"
              required
            >
              <option [ngValue]="null">Selecciona un cliente</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">
                {{ c.fullName }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">URL de la foto</label>
          <input
            class="form-input"
            name="petPhotoUrl"
            placeholder="https://…"
            [(ngModel)]="form.photoUrl"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Notas</label>
          <textarea
            class="form-textarea"
            rows="3"
            name="petNotes"
            placeholder="Alergias, cuidados especiales…"
            [(ngModel)]="form.notes"
          ></textarea>
        </div>
      </form>

      <div modal-footer style="display: flex; gap: 10px; justify-content: flex-end; width: 100%;">
        <button type="button" class="btn btn-secondary" (click)="editing = null">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          (click)="save()"
          [disabled]="saving"
        >
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </app-modal>

    <!-- Dialogo Confirmar Eliminar -->
    <app-confirm
      [open]="!!toDelete"
      title="Eliminar mascota"
      [message]="'¿Seguro que deseas eliminar a ' + toDelete?.name + '? Se quitará de la lista de pacientes.'"
      [loading]="deleting"
      (confirm)="remove()"
      (cancel)="toDelete = null"
    ></app-confirm>
  `
})
export class PetsComponent implements OnInit {
  private petService = inject(PetService);
  private userService = inject(UserService);

  pets: Pet[] = [];
  clients: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  search: string = '';
  selectedSpecies: string = 'Todas';
  standardSpecies = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Reptil', 'Pez', 'Otro'];

  editing: 'new' | Pet | null = null;
  form: PetCreateOrUpdateDto = { ...EMPTY_PET };
  saving: boolean = false;
  formError: string | null = null;

  toDelete: Pet | null = null;
  deleting: boolean = false;
  placeholderPet = PLACEHOLDER_PET;

  get speciesList(): string[] {
    const set = new Set(this.pets.map((p) => p.species).filter(Boolean));
    return ['Todas', ...Array.from(set)];
  }

  get filteredPets(): Pet[] {
    const q = this.search.trim().toLowerCase();
    return this.pets.filter((p) => {
      const matchSpecies = this.selectedSpecies === 'Todas' || p.species === this.selectedSpecies;
      const matchQuery =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q) ||
        p.species?.toLowerCase().includes(q);
      return matchSpecies && matchQuery;
    });
  }

  ngOnInit(): void {
    this.load();
    this.userService.getClients().subscribe({
      next: (data) => (this.clients = data),
      error: () => (this.clients = [])
    });
  }

  load(): void {
    this.loading = true;
    this.petService.getAll().subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cargar mascotas';
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.form = { ...EMPTY_PET };
    this.formError = null;
    this.editing = 'new';
  }

  openEdit(pet: Pet): void {
    this.form = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      gender: pet.gender || 'Macho',
      birthDate: pet.birthDate ? pet.birthDate.slice(0, 10) : '',
      weightKg: pet.weightKg ?? null,
      color: pet.color || '',
      photoUrl: pet.photoUrl || '',
      notes: pet.notes || '',
      ownerId: pet.ownerId ?? null,
    };
    this.formError = null;
    this.editing = pet;
  }

  save(): void {
    this.saving = true;
    this.formError = null;

    const payload: PetCreateOrUpdateDto = {
      ...this.form,
      ownerId: this.form.ownerId ? Number(this.form.ownerId) : null,
      weightKg: this.form.weightKg != null && this.form.weightKg !== ('' as any) ? Number(this.form.weightKg) : null,
      birthDate: this.form.birthDate || null,
      photoUrl: this.form.photoUrl || null,
      breed: this.form.breed || null,
      color: this.form.color || null,
      notes: this.form.notes || null,
    };

    const action =
      this.editing === 'new'
        ? this.petService.create(payload)
        : this.petService.update((this.editing as Pet).id, payload);

    action.subscribe({
      next: () => {
        this.saving = false;
        this.editing = null;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err?.error?.error || err?.message || 'Error al guardar mascota';
      }
    });
  }

  remove(): void {
    if (!this.toDelete) return;
    this.deleting = true;
    this.petService.delete(this.toDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.error || err?.message || 'Error al eliminar mascota';
        this.toDelete = null;
      }
    });
  }

  formatEdad(bDate?: string): string {
    return edad(bDate);
  }

  formatInitials(name?: string): string {
    return iniciales(name || '');
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement;
    el.src = PLACEHOLDER_PET;
  }
}
