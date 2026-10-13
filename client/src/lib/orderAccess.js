const STORAGE_KEY = 'mb_order_access_codes';

export const getOrderAccessCodes = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value)
      ? value.filter((entry) => entry && typeof entry.orderNumber === 'string' && typeof entry.code === 'string')
      : [];
  } catch {
    return [];
  }
};

export const saveOrderAccessCode = (orderNumber, code) => {
  if (typeof orderNumber !== 'string' || typeof code !== 'string' || !/^[a-f\d]{64}$/i.test(code)) return;
  const entries = getOrderAccessCodes().filter((entry) => entry.orderNumber !== orderNumber);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, { orderNumber, code }].slice(-50)));
};
