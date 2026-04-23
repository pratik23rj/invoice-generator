const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
}

function threeDigits(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${ONES[h]} Hundred`);
  if (rest > 0) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/** Convert a non-negative integer (up to 99,99,99,99,999) to Indian-English words. */
export function intToIndianWords(value: number): string {
  if (value === 0) return "Zero";
  if (value < 0) throw new Error("Negative values not supported");
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error("Integer required");
  }

  const crore = Math.floor(value / 10000000);
  const lakh = Math.floor((value % 10000000) / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const rest = value % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${intToIndianWords(crore)} Crore`);
  if (lakh > 0) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest > 0) parts.push(threeDigits(rest));
  return parts.join(" ");
}

/**
 * Indian-English rupee formatter.
 * Example: 12345.50 → "Twelve Thousand Three Hundred Forty-Five Rupees and Fifty Paise Only"
 */
export function rupeesInWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return `${value} (unrepresentable)`;
  }
  const rounded = Math.round(value * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  // Upper bound: fall back to numeric string beyond 99,99,99,99,999 rupees.
  if (rupees > 9999999999999) {
    return `${rounded.toFixed(2)} (too large)`;
  }

  const rupeePart = rupees === 0 ? "Zero Rupees" : `${intToIndianWords(rupees)} Rupees`;
  const paisePart = paise > 0 ? ` and ${twoDigits(paise)} Paise` : "";
  return `${rupeePart}${paisePart} Only`;
}
