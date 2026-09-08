function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

function errorHandler(error, req, res, next) {
  console.error(error.message);
  if (error.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted fields.' });
  if (error.code === 11000) return res.status(409).json({ message: 'That username or email is already in use.' });
  const status = error.statusCode || 500;
  res.status(status).json({ message: status === 500 ? 'Something went wrong on the server.' : error.message });
}

module.exports = { notFound, errorHandler };
