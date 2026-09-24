export function normalizeRoleCode(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') 
    .replace(/__+/g, '_'); 
}