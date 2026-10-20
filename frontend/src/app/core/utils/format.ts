const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const toDate = (value: string | number | Date | null | undefined): Date => {
  if (!value) return new Date(NaN);
  return value instanceof Date ? value : new Date(value);
};

export function fmtDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtTime(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function fmtDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${fmtDate(d)} · ${fmtTime(d)}`;
}

export function fmtDayLong(value: string | number | Date | null | undefined): string {
  const d = toDate(value || new Date());
  if (Number.isNaN(d.getTime())) return '';
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES_LARGOS[d.getMonth()]}`;
}

export function toLocalInput(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function edad(birthDate: string | number | Date | null | undefined): string {
  if (!birthDate) return '—';
  const b = toDate(birthDate);
  if (Number.isNaN(b.getTime())) return '—';
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) return '—';
  if (months < 1) return 'Recién nacido';
  if (months < 12) return `${months} mes${months > 1 ? 'es' : ''}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} a ${rest} m` : `${years} año${years > 1 ? 's' : ''}`;
}

export function iniciales(name: string = ''): string {
  return (
    name
      .replace(/^(Dr\.|Dra\.)\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

export const PLACEHOLDER_PET =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#EAF3EE"/><g fill="#5BA48A"><ellipse cx="200" cy="252" rx="62" ry="50"/><ellipse cx="146" cy="186" rx="26" ry="34"/><ellipse cx="254" cy="186" rx="26" ry="34"/><ellipse cx="112" cy="248" rx="22" ry="28"/><ellipse cx="288" cy="248" rx="22" rx="28"/></g></svg>`
  );
