export const LIVESTOCK_SPECIES = [
  'Vaca',
  'Toro',
  'Oveja',
  'Cabra',
  'Cerdo',
  'Caballo',
  'Burro',
  'Mula',
  'Llama',
  'Alpaca',
  'Búfalo',
] as const;

export const PRODUCTION_TYPES = [
  'Leche',
  'Carne',
  'Lana',
  'Fibra',
  'Trabajo',
  'Reproducción',
  'Doble propósito',
] as const;

const LIVESTOCK_SPECIES_NORMALIZED = new Set(
  LIVESTOCK_SPECIES.map((species) => species.toLocaleLowerCase('es'))
);

export function isLivestockSpecies(species: string | null | undefined): boolean {
  return !!species && LIVESTOCK_SPECIES_NORMALIZED.has(species.trim().toLocaleLowerCase('es'));
}
