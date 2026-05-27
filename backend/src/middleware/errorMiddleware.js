const { failure } = require('../utils/response');

function notFound(req, res) {
  return failure(res, 'Ruta no encontrada', 404);
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message =
    status === 500 ? 'Error interno del servidor' : error.message;

  if (status === 500) {
    console.error(error);
  }

  return failure(res, message, status);
}

module.exports = { notFound, errorHandler };
