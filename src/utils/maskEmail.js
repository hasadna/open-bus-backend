/**
 * @param {string} email
 * @param {number} visibleChars
 */
export function maskEmail(email, visibleChars = 3) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLength = Math.max(local.length - visibleChars, 0);
  return `${local.slice(0, visibleChars)}${'*'.repeat(maskedLength)}@${domain}`;
}
