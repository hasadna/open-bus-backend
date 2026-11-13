import { mobileOnly } from '../schemas/complaints.schema.js';

export function idValidator(id: string) {
  const n = Number(id);
  if (!n || isNaN(n) || id.length !== 9 || n <= 0) return false;
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) {
    const num = Number(id[i]) * ((i % 2) + 1);
    sum += Math.floor(num / 10) + (num % 10);
  }
  return sum % 10 === 0;
}

export function mobileValidator(mobile: string) {
  if (mobile && mobileOnly.test(mobile)) {
    if (mobile.length === 10) return `${mobile.slice(0, 3)}-${mobile.slice(3)}`;
    return mobile;
  }
  return false;
}
