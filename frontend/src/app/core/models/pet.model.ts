export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  weightKg?: number | null;
  color?: string;
  photoUrl?: string;
  notes?: string;
  ownerId?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  createdAt?: string;
}

export interface PetCreateOrUpdateDto {
  name: string;
  species: string;
  breed?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  weightKg?: number | null;
  color?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
  ownerId?: number | null;
}
