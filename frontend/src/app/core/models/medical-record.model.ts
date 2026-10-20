export interface MedicalRecord {
  id: number;
  date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  recordedWeightKg?: number | null;
  notes?: string;
  petId: number;
  petName: string;
  petSpecies?: string;
  veterinarianId?: number;
  veterinarianName?: string;
  ownerName?: string;
  createdAt?: string;
}

export interface MedicalRecordCreateDto {
  petId: number;
  veterinarianId?: number | null;
  date: string;
  reason: string;
  diagnosis?: string | null;
  treatment?: string | null;
  prescription?: string | null;
  recordedWeightKg?: number | null;
  notes?: string | null;
}
