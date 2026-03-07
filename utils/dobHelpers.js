export const formatDobInput = (text) => {
  const digits = text.replace(/\D/g, '');
  let formatted = '';
  if (digits.length > 0) formatted += digits.substring(0, 2);
  if (digits.length > 2) formatted += '/' + digits.substring(2, 4);
  if (digits.length > 4) formatted += '/' + digits.substring(4, 8);
  return formatted;
};

export const parseDobToISO = (dobStr) => {
  const parts = dobStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};
