/**
 * Formate un montant en centimes en string lisible.
 * Ex: 1500 -> "15,00 EUR", 999 -> "9,99 EUR"
 */
export function formatCurrency(cents: number, currency = 'EUR'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formate une date ISO en string lisible.
 */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

/**
 * Formate un nombre avec separateurs de milliers.
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

/**
 * Calcule le pourcentage de progression.
 */
export function progressPercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}
