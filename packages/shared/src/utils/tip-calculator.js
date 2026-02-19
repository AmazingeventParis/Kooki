"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipSuggestion = tipSuggestion;
exports.validateTip = validateTip;
const TIP_MAX_CENTS = 10_00;
function tipSuggestion(donationAmountCents) {
    if (donationAmountCents <= 0)
        return 0;
    const raw = donationAmountCents * 0.05;
    const roundedTo50Cents = Math.ceil(raw / 50) * 50;
    return Math.min(roundedTo50Cents, TIP_MAX_CENTS);
}
function validateTip(tipCents) {
    return Math.max(0, Math.min(Math.round(tipCents), TIP_MAX_CENTS));
}
//# sourceMappingURL=tip-calculator.js.map