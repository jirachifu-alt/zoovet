export interface VaccineRecord {
  id: number;
  vaccineName: string;
  applicationDate: string;
  nextDueDate?: string;
  batchNumber?: string;
  notes?: string;
  petId: number;
  petName: string;
  petSpecies?: string;
  veterinarianId?: number;
  veterinarianName?: string;
  createdAt?: string;
}

export interface VaccineRecordCreateDto {
  petId: number;
  vaccineName: string;
  applicationDate: string;
  nextDueDate?: string | null;
  veterinarianId?: number | null;
  batchNumber?: string | null;
  notes?: string | null;
}
