import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Muestra el primer error de validación de un control reactivo.
 * Se reutiliza en todos los formularios para mantener mensajes consistentes.
 */
@Component({
  selector: 'app-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="field-error" *ngIf="showError">
      <span aria-hidden="true">•</span> {{ message }}
    </p>
  `
})
export class FieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label = 'Este campo';

  get showError(): boolean {
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get message(): string {
    const errors = this.control?.errors;
    if (!errors) return '';

    if (errors['required']) return `${this.label} es un campo obligatorio.`;
    if (errors['email']) return 'Ingresa un correo electrónico válido.';
    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
    }
    if (errors['maxlength']) {
      return `No debe superar los ${errors['maxlength'].requiredLength} caracteres.`;
    }
    if (errors['min']) return `El valor mínimo permitido es ${errors['min'].min}.`;
    if (errors['max']) return `El valor máximo permitido es ${errors['max'].max}.`;
    if (errors['pattern']) return 'El formato ingresado no es válido.';
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden.';
    if (errors['pastDate']) return 'Selecciona una fecha y hora posteriores al momento actual.';
    if (errors['futureDate']) return 'La fecha no puede ser futura.';
    if (errors['dateRange']) return 'La fecha debe ser igual o posterior a la fecha de aplicación.';
    if (errors['invalidDate']) return 'Ingresa una fecha válida.';

    return 'Revisa este campo.';
  }
}
