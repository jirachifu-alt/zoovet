import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetService } from '../../core/services/pet.service';
import { UserService } from '../../core/services/user.service';
import { Pet, PetCreateOrUpdateDto } from '../../core/models/pet.model';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';
import { apiErrorMessage } from '../../core/utils/api-error';
import { notFutureDateValidator } from '../../core/utils/validators';
import { edad, iniciales, PLACEHOLDER_PET } from '../../core/utils/format';
import { isLivestockSpecies, LIVESTOCK_SPECIES, PRODUCTION_TYPES } from '../../core/utils/livestock';

const EMPTY_PET = {
  name: '',
  species: 'Perro',
  breed: '',
  productionType: '',
  farmName: '',
  recordCode: '',
  gender: 'Macho',
  birthDate: '',
  weightKg: null as number | null,
  color: '',
  photoUrl: '',
  notes: '',
  ownerId: null as number | null,
};

@Component({
  selector: 'app-pets',
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
        <h2 class="page-title">{{ pageTitle }}</h2>
        <p class="page-subtitle">
          @if (livestockMode) {
            {{ pets.length }} animal{{ pets.length === 1 ? '' : 'es' }} de producción y granja
          } @else {
            {{ pets.length }} paciente{{ pets.length === 1 ? '' : 's' }} en la clínica
          }
        </p>
      </div>
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            class="form-input"
            [placeholder]="livestockMode ? 'Buscar por nombre, raza o granja…' : 'Buscar por nombre, raza o dueño…'"
            [(ngModel)]="search"
          />
        </div>
        <button type="button" class="btn btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="16"></app-icon> {{ livestockMode ? 'Nuevo animal' : 'Nueva mascota' }}
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
        <app-icon [name]="livestockMode ? 'wheat' : 'paw'" [size]="26"></app-icon>
      </span>
      <h3>Sin resultados</h3>
      <p>
        {{ livestockMode
          ? 'No encontramos animales de granja con ese criterio. Registra uno nuevo para comenzar.'
          : 'No encontramos pacientes con ese criterio. Registra uno nuevo para comenzar.' }}
      </p>
      <button type="button" class="btn btn-primary" (click)="openCreate()">
        <app-icon name="plus" [size]="16"></app-icon> {{ livestockMode ? 'Nuevo animal' : 'Nueva mascota' }}
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
          <span class="badge badge-species">
            {{ pet.species }}<ng-container *ngIf="isLivestock(pet)"> · Zootecnia</ng-container>
          </span>
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
          <p class="pet-breed" *ngIf="isLivestock(pet) && (pet.productionType || pet.farmName || pet.recordCode)">
            <ng-container *ngIf="pet.recordCode">{{ pet.recordCode }} · </ng-container>
            {{ pet.productionType || 'Producción' }}<ng-container *ngIf="pet.farmName"> · {{ pet.farmName }}</ng-container>
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
      [title]="editing === 'new'
        ? (livestockMode ? 'Nuevo animal de granja' : 'Nueva mascota')
        : 'Editar ' + (petForm.controls.name.value || (livestockMode ? 'animal' : 'mascota'))"
      (close)="editing = null"
    >
      <form id="pet-form" [formGroup]="petForm" (ngSubmit)="save()" novalidate>
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="pet-name">Nombre *</label>
            <input
              id="pet-name"
              class="form-input"
              formControlName="name"
              placeholder="Ej. Luna"
              [class.is-invalid]="isInvalid('name')"
              [attr.aria-invalid]="isInvalid('name')"
            />
            <app-field-error [control]="petForm.controls.name" label="El nombre"></app-field-error>
          </div>
          <div class="form-group">
            <label class="form-label" for="pet-species">Especie *</label>
            <select
              id="pet-species"
              class="form-select"
              formControlName="species"
              [class.is-invalid]="isInvalid('species')"
              [attr.aria-invalid]="isInvalid('species')"
            >
              <optgroup label="Mascotas" *ngIf="!livestockMode">
                <option *ngFor="let s of standardSpecies" [ngValue]="s">{{ s }}</option>
              </optgroup>
              <optgroup label="Animales de granja">
                <option *ngFor="let s of livestockSpecies" [ngValue]="s">{{ s }}</option>
              </optgroup>
            </select>
            <app-field-error [control]="petForm.controls.species" label="La especie"></app-field-error>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="pet-breed">Raza</label>
            <input
              id="pet-breed"
              class="form-input"
              formControlName="breed"
              placeholder="Ej. Golden Retriever"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="pet-gender">Sexo</label>
            <select id="pet-gender" class="form-select" formControlName="gender">
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
        </div>

        <div class="field-row" *ngIf="showLivestockFields">
          <div class="form-group">
            <label class="form-label" for="pet-record-code">Código / arete</label>
            <input
              id="pet-record-code"
              class="form-input"
              formControlName="recordCode"
              placeholder="Ej. VAC-001"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="pet-production-type">Tipo de producción</label>
            <select id="pet-production-type" class="form-select" formControlName="productionType">
              <option value="">Selecciona una opción</option>
              <option *ngFor="let p of productionTypes" [ngValue]="p">{{ p }}</option>
            </select>
          </div>
        </div>

        <div class="form-group" *ngIf="showLivestockFields">
          <label class="form-label" for="pet-farm-name">Finca / granja</label>
          <input
            id="pet-farm-name"
            class="form-input"
            formControlName="farmName"
            placeholder="Ej. Granja Santa Rosa"
          />
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="pet-birthdate">Fecha de nacimiento</label>
            <input
              id="pet-birthdate"
              class="form-input"
              type="date"
              formControlName="birthDate"
              [class.is-invalid]="isInvalid('birthDate')"
              [attr.aria-invalid]="isInvalid('birthDate')"
            />
            <app-field-error [control]="petForm.controls.birthDate" label="La fecha"></app-field-error>
          </div>
          <div class="form-group">
            <label class="form-label" for="pet-weight">Peso (kg)</label>
            <input
              id="pet-weight"
              class="form-input"
              type="number"
              step="0.1"
              min="0"
              formControlName="weightKg"
              placeholder="Ej. 12.5"
              [class.is-invalid]="isInvalid('weightKg')"
              [attr.aria-invalid]="isInvalid('weightKg')"
            />
            <app-field-error [control]="petForm.controls.weightKg" label="El peso"></app-field-error>
          </div>
        </div>

        <div class="field-row">
          <div class="form-group">
            <label class="form-label" for="pet-color">Color</label>
            <input
              id="pet-color"
              class="form-input"
              formControlName="color"
              placeholder="Ej. Dorado"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="pet-owner">{{ livestockMode ? 'Propietario / responsable *' : 'Propietario *' }}</label>
            <select
              id="pet-owner"
              class="form-select"
              formControlName="ownerId"
              [class.is-invalid]="isInvalid('ownerId')"
              [attr.aria-invalid]="isInvalid('ownerId')"
            >
              <option [ngValue]="null">Selecciona un cliente</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">
                {{ c.fullName }}
              </option>
            </select>
            <app-field-error [control]="petForm.controls.ownerId" label="El propietario"></app-field-error>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="pet-photo">URL de la foto</label>
          <input
            id="pet-photo"
            class="form-input"
            formControlName="photoUrl"
            placeholder="https://…"
            [class.is-invalid]="isInvalid('photoUrl')"
            [attr.aria-invalid]="isInvalid('photoUrl')"
          />
          <app-field-error [control]="petForm.controls.photoUrl" label="La URL"></app-field-error>
        </div>

        <div class="form-group">
          <label class="form-label" for="pet-notes">Notas</label>
          <textarea
            id="pet-notes"
            class="form-textarea"
            rows="3"
            formControlName="notes"
            placeholder="Alergias, cuidados especiales…"
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
      [title]="livestockMode ? 'Eliminar animal' : 'Eliminar mascota'"
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
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  readonly livestockMode = this.route.snapshot.data['livestock'] === true;

  pets: Pet[] = [];
  clients: User[] = [];
  loading: boolean = true;
  error: string | null = null;

  search: string = '';
  selectedSpecies: string = 'Todas';
  standardSpecies = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Reptil', 'Pez', 'Otro'];
  livestockSpecies = [...LIVESTOCK_SPECIES];
  productionTypes = [...PRODUCTION_TYPES];

  get pageTitle(): string {
    return this.livestockMode ? 'Zootecnia' : 'Pacientes';
  }

  get showLivestockFields(): boolean {
    return this.livestockMode || isLivestockSpecies(this.petForm.controls.species.value);
  }

  editing: 'new' | Pet | null = null;
  saving: boolean = false;
  formError: string | null = null;

  petForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    species: ['Perro', [Validators.required]],
    breed: [''],
    productionType: [''],
    farmName: [''],
    recordCode: [''],
    gender: ['Macho'],
    birthDate: ['', [notFutureDateValidator()]],
    weightKg: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(2000)]),
    color: [''],
    photoUrl: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
    notes: [''],
    ownerId: this.fb.control<number | null>(null, [Validators.required])
  });

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
        p.species?.toLowerCase().includes(q) ||
        p.farmName?.toLowerCase().includes(q) ||
        p.recordCode?.toLowerCase().includes(q);
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
    this.petService.getAll({ livestock: this.livestockMode }).subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = apiErrorMessage(err, 'Error al cargar mascotas');
        this.loading = false;
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.petForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  openCreate(): void {
    this.petForm.reset({
      ...EMPTY_PET,
      species: this.livestockMode ? 'Vaca' : 'Perro',
    });
    this.formError = null;
    this.editing = 'new';
  }

  openEdit(pet: Pet): void {
    this.petForm.reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      productionType: pet.productionType || '',
      farmName: pet.farmName || '',
      recordCode: pet.recordCode || '',
      gender: pet.gender || 'Macho',
      birthDate: pet.birthDate ? pet.birthDate.slice(0, 10) : '',
      weightKg: pet.weightKg ?? null,
      color: pet.color || '',
      photoUrl: pet.photoUrl || '',
      notes: pet.notes || '',
      ownerId: pet.ownerId ?? null,
    });
    this.formError = null;
    this.editing = pet;
  }

  save(): void {
    this.formError = null;
    this.petForm.markAllAsTouched();
    if (this.petForm.invalid) {
      this.formError = 'Revisa los campos marcados en rojo.';
      return;
    }

    this.saving = true;
    const raw = this.petForm.getRawValue();
    const payload: PetCreateOrUpdateDto = {
      name: raw.name.trim(),
      species: raw.species,
      breed: raw.breed.trim() || null,
      productionType: raw.productionType.trim() || null,
      farmName: raw.farmName.trim() || null,
      recordCode: raw.recordCode.trim() || null,
      gender: raw.gender || null,
      birthDate: raw.birthDate || null,
      weightKg: raw.weightKg != null ? Number(raw.weightKg) : null,
      color: raw.color.trim() || null,
      photoUrl: raw.photoUrl.trim() || null,
      notes: raw.notes.trim() || null,
      ownerId: raw.ownerId ? Number(raw.ownerId) : null,
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
        this.formError = apiErrorMessage(err, 'Error al guardar mascota');
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
        this.error = apiErrorMessage(err, 'Error al eliminar mascota');
        this.toDelete = null;
      }
    });
  }

  isLivestock(pet: Pet): boolean {
    return isLivestockSpecies(pet.species);
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
