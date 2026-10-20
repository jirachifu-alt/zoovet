import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="className"
      style="display: inline-block; vertical-align: middle;"
    >
      <!-- Database -->
      <ng-container *ngIf="name === 'database'">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </ng-container>

      <!-- PawPrint -->
      <ng-container *ngIf="name === 'paw' || name === 'paw-print'">
        <circle cx="11" cy="4" r="2" />
        <circle cx="18" cy="8" r="2" />
        <circle cx="20" cy="16" r="2" />
        <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 20.18A3.5 3.5 0 0 1 2 15a5 5 0 0 1 7-5Z" />
      </ng-container>

      <!-- CalendarDays -->
      <ng-container *ngIf="name === 'calendar' || name === 'calendar-days'">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
      </ng-container>

      <!-- CalendarClock -->
      <ng-container *ngIf="name === 'calendar-clock'">
        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h5" />
        <path d="M17.5 17.5 16 16.25V14" />
        <circle cx="16" cy="16" r="6" />
      </ng-container>

      <!-- Stethoscope -->
      <ng-container *ngIf="name === 'stethoscope'">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </ng-container>

      <!-- Syringe -->
      <ng-container *ngIf="name === 'syringe'">
        <path d="m18 2 4 4" />
        <path d="m17 7 3-3" />
        <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
        <path d="m9 11 4 4" />
        <path d="m5 19-3 3" />
        <path d="m14 4 6 6" />
      </ng-container>

      <!-- Users -->
      <ng-container *ngIf="name === 'users'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </ng-container>

      <!-- UserRound -->
      <ng-container *ngIf="name === 'user' || name === 'user-round'">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </ng-container>

      <!-- LogOut -->
      <ng-container *ngIf="name === 'logout' || name === 'log-out'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </ng-container>

      <!-- Menu -->
      <ng-container *ngIf="name === 'menu'">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </ng-container>

      <!-- X -->
      <ng-container *ngIf="name === 'x'">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </ng-container>

      <!-- Bell -->
      <ng-container *ngIf="name === 'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </ng-container>

      <!-- Plus -->
      <ng-container *ngIf="name === 'plus'">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </ng-container>

      <!-- Search -->
      <ng-container *ngIf="name === 'search'">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </ng-container>

      <!-- Pencil -->
      <ng-container *ngIf="name === 'pencil'">
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        <path d="m15 5 4 4" />
      </ng-container>

      <!-- Trash2 -->
      <ng-container *ngIf="name === 'trash' || name === 'trash-2'">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </ng-container>

      <!-- CheckCircle2 -->
      <ng-container *ngIf="name === 'check' || name === 'check-circle-2'">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </ng-container>

      <!-- XCircle -->
      <ng-container *ngIf="name === 'x-circle'">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </ng-container>

      <!-- AlertTriangle -->
      <ng-container *ngIf="name === 'alert-triangle' || name === 'warning'">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </ng-container>

      <!-- AlertCircle -->
      <ng-container *ngIf="name === 'alert-circle'">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </ng-container>

      <!-- FileHeart -->
      <ng-container *ngIf="name === 'file-heart'">
        <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10.29 10.7a2.43 2.43 0 0 0-2.66-.52c-.29.12-.56.3-.78.53l-.35.34-.35-.34a2.43 2.43 0 0 0-2.65-.53c-.3.12-.56.3-.79.53-.95.94-1 2.53.2 3.74L6.5 18l3.6-3.57c1.19-1.21 1.13-2.8.19-3.73Z" />
      </ng-container>

      <!-- FileText -->
      <ng-container *ngIf="name === 'file-text'">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </ng-container>

      <!-- ShieldCheck -->
      <ng-container *ngIf="name === 'shield-check'">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </ng-container>

      <!-- Mail -->
      <ng-container *ngIf="name === 'mail'">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </ng-container>

      <!-- Lock -->
      <ng-container *ngIf="name === 'lock'">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </ng-container>

      <!-- Eye -->
      <ng-container *ngIf="name === 'eye'">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </ng-container>

      <!-- EyeOff -->
      <ng-container *ngIf="name === 'eye-off'">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </ng-container>

      <!-- ArrowUpRight -->
      <ng-container *ngIf="name === 'arrow-up-right'">
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </ng-container>

      <!-- Dashboard -->
      <ng-container *ngIf="name === 'dashboard' || name === 'layout-dashboard'">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </ng-container>
    </svg>
  `
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: number = 18;
  @Input() className: string = '';
}
