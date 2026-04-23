/** Format a number as Indian-grouped currency string: "1,23,456.78" (no ₹ prefix). */
export function formatIndianNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const negative = rounded < 0 ? "-" : "";
  const [intPart, decPart = "00"] = Math.abs(rounded).toFixed(2).split(".");

  let formattedInt: string;
  if (intPart.length <= 3) {
    formattedInt = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const restWithCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formattedInt = `${restWithCommas},${last3}`;
  }

  return `${negative}${formattedInt}.${decPart}`;
}

/** Format with ₹ prefix: "₹1,23,456.78". */
export function formatRupees(value: number): string {
  return `₹${formatIndianNumber(value)}`;
}
