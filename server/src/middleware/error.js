export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });

export const errorHandler = (e, req, res, next) => {
  let status = e.status || 500;
  let message = e.message || 'Server error';
  if (e.name === 'CastError') { status = 400; message = 'Invalid id or value'; }
  if (e.name === 'ValidationError') { status = 400; message = Object.values(e.errors).map((x) => x.message).join(', '); }
  if (e.code === 11000) { status = 409; message = 'This value already exists'; }
  if (status === 500) console.error(e);
  res.status(status).json({ message });
};
