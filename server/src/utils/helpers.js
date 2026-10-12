export const err = (status, message) => Object.assign(new Error(message), { status });
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const PHONE = /^01[3-9]\d{8}$/;
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
