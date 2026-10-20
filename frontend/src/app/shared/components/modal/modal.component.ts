import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="modal-overlay" (mousedown)="onOverlayClick($event)">
      <div class="modal-content" [style.max-width.px]="width || null">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button
            type="button"
            class="btn btn-secondary btn-icon"
            (click)="close.emit()"
            aria-label="Cerrar"
          >
            <app-icon name="x" [size]="17"></app-icon>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() width?: number;
  @Input() showFooter: boolean = true;
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.close.emit();
    }
  }
}
