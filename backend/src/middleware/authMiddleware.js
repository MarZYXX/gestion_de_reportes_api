const { auth } = require('../config/firebaseAdmin');
const { failure } = require('../utils/response');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return failure(res, 'Token de autenticacion requerido', 401);
  }

  try {
    req.user = await auth.verifyIdToken(token);
    return next();
  } catch (error) {
    return failure(res, 'Token de autenticacion invalido', 401);
  }
}

module.exports = { authenticate };
