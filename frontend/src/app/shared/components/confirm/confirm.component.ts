import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, ModalComponent, IconComponent],
  template: `
    <app-modal
      *ngIf="open"
      [title]="title"
      [width]="440"
      (close)="cancel.emit()"
    >
      <div class="confirm-body">
        <span class="confirm-icon">
          <app-icon name="alert-triangle" [size]="20"></app-icon>
        </span>
        <p>{{ message }}</p>
      </div>

      <div modal-footer style="display: flex; gap: 10px; justify-content: flex-end; width: 100%;">
        <button
          type="button"
          class="btn btn-secondary"
          (click)="cancel.emit()"
          [disabled]="loading"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-danger"
          (click)="confirm.emit()"
          [disabled]="loading"
        >
          {{ loading ? 'Procesando…' : confirmLabel }}
        </button>
      </div>
    </app-modal>
  `
})
export class ConfirmComponent {
  @Input() open: boolean = false;
  @Input() title: string = 'Confirmación';
  @Input() message: string = '¿Estás seguro de realizar esta acción?';
  @Input() confirmLabel: string = 'Eliminar';
  @Input() loading: boolean = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
