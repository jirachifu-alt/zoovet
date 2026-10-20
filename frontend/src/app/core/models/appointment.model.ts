export type AppointmentStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'EN_ATENCION'
  | 'COMPLETADA'
  | 'CANCELADA';

export interface Appointment {
  id: number;
  dateTime: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  petId: number;
  petName: string;
  petSpecies?: string;
  clientId?: number;
  clientName?: string;
  veterinarianId?: number;
  veterinarianName?: string;
  createdAt?: string;
}

export interface AppointmentCreateDto {
  petId: number;
  clientId?: number | null;
  veterinarianId?: number | null;
  dateTime: string;
  reason: string;
  notes?: string | null;
}
