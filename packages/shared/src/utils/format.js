"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatNumber = formatNumber;
exports.progressPercent = progressPercent;
function formatCurrency(cents, currency = 'EUR') {
    const amount = cents / 100;
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
function formatDate(isoDate) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(isoDate));
}
function formatNumber(n) {
    return new Intl.NumberFormat('fr-FR').format(n);
}
function progressPercent(current, max) {
    if (max <= 0)
        return 0;
    return Math.min(Math.round((current / max) * 100), 100);
}
//# sourceMappingURL=format.js.map