/**
 * Genere un slug URL-friendly a partir d'un titre.
 * Ex: "Ma super cagnotte !" -> "ma-super-cagnotte"
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caracteres speciaux
    .replace(/[\s_]+/g, '-') // Espaces -> tirets
    .replace(/-+/g, '-') // Tirets multiples -> un seul
    .replace(/^-+|-+$/g, ''); // Supprime tirets debut/fin
}

/**
 * Genere un slug unique en ajoutant un suffixe aleatoire.
 */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
