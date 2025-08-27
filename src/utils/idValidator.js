export function IDValidator(id) {
  const n = Number(id);
  if (!n || isNaN(n) || id.length !== 9 || n <= 0) return false;
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) {
    const num = Number(id[i]) * ((i % 2) + 1);
    sum += Math.floor(num / 10) + (num % 10);
  }
  return sum % 10 === 0;
}
