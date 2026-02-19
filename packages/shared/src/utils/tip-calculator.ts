const TIP_MAX_CENTS = 10_00; // 10 EUR max

/**
 * Calcule la suggestion de contribution volontaire.
 * ~5% du montant du don, arrondi a 0.50 EUR pres, plafonne a 10 EUR.
 * @param donationAmountCents Montant du don en centimes
 * @returns Montant suggere en centimes
 */
export function tipSuggestion(donationAmountCents: number): number {
  if (donationAmountCents <= 0) return 0;
  const raw = donationAmountCents * 0.05;
  const roundedTo50Cents = Math.ceil(raw / 50) * 50;
  return Math.min(roundedTo50Cents, TIP_MAX_CENTS);
}

/**
 * Valide et plafonne le montant du tip.
 * @param tipCents Montant du tip en centimes
 * @returns Montant valide en centimes (0 a 1000)
 */
export function validateTip(tipCents: number): number {
  return Math.max(0, Math.min(Math.round(tipCents), TIP_MAX_CENTS));
}
