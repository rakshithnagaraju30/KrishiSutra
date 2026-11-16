/**
 * Indian mobile numbers → E.164 (+91XXXXXXXXXX).
 * Accepts the usual ways people type them: "98765 43210", "098765-43210", "+91 98765 43210",
 * "919876543210", "0091 9876543210". Indian mobile numbers have 10 digits and start with 6–9.
 */
export function normaliseIndianMobile(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

/** "+919876543210" → "+91 ••••••3210" — for responses and logs that must not show the full number. */
export function maskPhone(e164: string): string {
  return `${e164.slice(0, 3)} ••••••${e164.slice(-4)}`;
}
