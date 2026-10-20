import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { fmtDateTime, fmtDayLong, PLACEHOLDER_PET } from '../../core/utils/format';

export const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDIENTE: { label: 'Pendiente', cls: 'badge-pending' },
  CONFIRMADA: { label: 'Confirmada', cls: 'badge-confirmed' },
  EN_ATENCION: { label: 'En atención', cls: 'badge-progress' },
  COMPLETADA: { label: 'Completada', cls: 'badge-completed' },
  CANCELADA: { label: 'Cancelada', cls: 'badge-canceled' },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Resumen de la clínica</h2>
        <p class="page-subtitle">{{ todayFormatted }} · Estado general de ZooVet</p>
      </div>
      <div class="toolbar">
        <a routerLink="/mascotas" class="btn btn-secondary">
          <app-icon name="plus" [size]="16"></app-icon> Nueva mascota
        </a>
        <a routerLink="/citas" class="btn btn-primary">
          <app-icon name="calendar-days" [size]="16"></app-icon> Nueva cita
        </a>
      </div>
    </div>

    <!-- Error state -->
    <div class="empty-state" *ngIf="error">
      <p>No se pudieron cargar las estadísticas: {{ error }}</p>
    </div>

    <!-- Skeleton loader -->
    <div class="stat-grid" *ngIf="loading && !error">
      <div class="card skeleton" *ngFor="let i of [1, 2, 3, 4]" style="height: 132px;"></div>
    </div>

    <!-- Stat cards -->
    <ng-container *ngIf="stats && !loading">
      <div class="stat-grid">
        <div class="card stat-card">
          <span class="stat-ic green">
            <app-icon name="paw" [size]="19"></app-icon>
          </span>
          <div>
            <p class="stat-label">Pacientes registrados</p>
            <p class="stat-value">{{ stats.totalPets }}</p>
            <p class="stat-hint">Mascotas activas</p>
          </div>
        </div>

        <div class="card stat-card">
          <span class="stat-ic amber">
            <app-icon name="calendar-clock" [size]="19"></app-icon>
          </span>
          <div>
            <p class="stat-label">Citas pendientes</p>
            <p class="stat-value">{{ stats.pendingAppointments }}</p>
            <p class="stat-hint">Requieren confirmación</p>
          </div>
        </div>

        <div class="card stat-card">
          <span class="stat-ic blue">
            <app-icon name="users" [size]="19"></app-icon>
          </span>
          <div>
            <p class="stat-label">Clientes</p>
            <p class="stat-value">{{ stats.totalClients }}</p>
            <p class="stat-hint">Propietarios en padrón</p>
          </div>
        </div>

        <div class="card stat-card">
          <span class="stat-ic violet">
            <app-icon name="syringe" [size]="19"></app-icon>
          </span>
          <div>
            <p class="stat-label">Vacunas aplicadas</p>
            <p class="stat-value">{{ stats.totalVaccines }}</p>
            <p class="stat-hint">Historial de inmunización</p>
          </div>
        </div>
      </div>

      <div class="dash-grid">
        <!-- Próximas citas -->
        <section class="card">
          <header class="section-head">
            <h3>Próximas citas</h3>
            <a routerLink="/citas" class="link">
              Ver todas <app-icon name="arrow-up-right" [size]="14"></app-icon>
            </a>
          </header>

          <p class="muted" *ngIf="stats.upcomingAppointments.length === 0">
            No hay citas programadas.
          </p>

          <ul class="appt-list" *ngIf="stats.upcomingAppointments.length > 0">
            <li *ngFor="let a of stats.upcomingAppointments">
              <span class="appt-date">
                <strong>{{ getDay(a.dateTime) }}</strong>
                <small>{{ getMonthShort(a.dateTime) }}</small>
              </span>
              <div class="appt-info">
                <strong>
                  {{ a.petName }} <span class="muted">· {{ a.petSpecies }}</span>
                </strong>
                <small>
                  {{ formatDateTime(a.dateTime) }} · {{ a.veterinarianName || 'Sin asignar' }}
                </small>
              </div>
              <span class="badge" [ngClass]="getStatusCls(a.status)">
                {{ getStatusLabel(a.status) }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Pacientes recientes -->
        <section class="card">
          <header class="section-head">
            <h3>Pacientes recientes</h3>
            <a routerLink="/mascotas" class="link">
              Ver todos <app-icon name="arrow-up-right" [size]="14"></app-icon>
            </a>
          </header>

          <p class="muted" *ngIf="stats.recentPets.length === 0">
            Aún no hay pacientes registrados.
          </p>

          <ul class="pet-mini-list" *ngIf="stats.recentPets.length > 0">
            <li *ngFor="let p of stats.recentPets">
              <img
                [src]="p.photoUrl || placeholderPet"
                [alt]="p.name"
                (error)="onImgError($event)"
              />
              <div>
                <strong>{{ p.name }}</strong>
                <small>{{ p.breed || p.species }} · {{ p.ownerName }}</small>
              </div>
              <span class="badge badge-species">{{ p.species }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Mini métricas inferiores -->
      <div class="mini-metrics">
        <div class="metric">
          <span>Citas registradas</span>
          <strong>{{ stats.totalAppointments }}</strong>
        </div>
        <div class="metric">
          <span>Confirmadas</span>
          <strong>{{ stats.confirmedAppointments }}</strong>
        </div>
        <div class="metric">
          <span>Completadas</span>
          <strong>{{ stats.completedAppointments }}</strong>
        </div>
        <div class="metric">
          <span>Historiales clínicos</span>
          <strong>{{ stats.totalMedicalRecords }}</strong>
        </div>
        <div class="metric">
          <span>Veterinarios</span>
          <strong>{{ stats.totalVeterinarians }}</strong>
        </div>
      </div>
    </ng-container>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats: DashboardStats | null = null;
  loading: boolean = true;
  error: string | null = null;
  placeholderPet = PLACEHOLDER_PET;

  get todayFormatted(): string {
    return fmtDayLong(new Date());
  }

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'Error al cargar estadísticas';
        this.loading = false;
      }
    });
  }

  getDay(dt: string): number {
    return new Date(dt).getDate();
  }

  getMonthShort(dt: string): string {
    return new Date(dt).toLocaleString('es', { month: 'short' }).replace('.', '');
  }

  formatDateTime(dt: string): string {
    return fmtDateTime(dt);
  }

  getStatusCls(status: string): string {
    return STATUS_MAP[status]?.cls || 'badge-pending';
  }

  getStatusLabel(status: string): string {
    return STATUS_MAP[status]?.label || status;
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement;
    el.src = PLACEHOLDER_PET;
  }
}
