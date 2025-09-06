export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong'
    }
  };
  res.status(status).json(payload);
}
