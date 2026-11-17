import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Valida que la confirmación coincida con el campo "password". */
export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get('password')?.value;
    if (!password || !control.value) return null;
    return password === control.value ? null : { passwordMismatch: true };
  };
}

/** Valida que una fecha y hora sean posteriores al momento actual. */
export function futureDateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const date = new Date(control.value);
    if (Number.isNaN(date.getTime())) return { invalidDate: true };
    return date.getTime() <= Date.now() ? { pastDate: true } : null;
  };
}

/** Valida que una fecha no sea futura (por ejemplo, fecha de nacimiento). */
export function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const date = new Date(control.value);
    if (Number.isNaN(date.getTime())) return { invalidDate: true };
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return date.getTime() > todayEnd.getTime() ? { futureDate: true } : null;
  };
}

/** Valida que una fecha sea igual o posterior al control indicado. */
export function dateAfterValidator(startControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startValue = control.parent?.get(startControlName)?.value;
    const endValue = control.value;
    if (!startValue || !endValue) return null;

    const start = new Date(startValue);
    const end = new Date(endValue);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { invalidDate: true };
    }

    return end.getTime() < start.getTime() ? { dateRange: true } : null;
  };
}
