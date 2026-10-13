const STORAGE_KEY = 'mb_support_access_codes';

export const getSupportAccessCodes = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter((code) => typeof code === 'string') : [];
  } catch {
    return [];
  }
};

export const saveSupportAccessCode = (code) => {
  if (typeof code !== 'string' || !/^[a-f\d]{64}$/i.test(code)) return;
  const codes = [...new Set([...getSupportAccessCodes(), code])].slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
};
