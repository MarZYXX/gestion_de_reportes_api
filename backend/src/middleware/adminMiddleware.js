const { db } = require('../config/firebaseAdmin');
const { failure } = require('../utils/response');

async function requireAdmin(req, res, next) {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return failure(res, 'No tienes permisos administrativos', 403);
    }

    req.user.role = 'admin';
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAdmin };
