const { db } = require('../config/firebaseAdmin');
const { httpError } = require('./reportes.service');

async function getUser(uid) {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) throw httpError(404, 'Usuario no encontrado');
  const data = doc.data();
  return {
    id: doc.id,
    nombre: data.nombre || '',
    apellidoPaterno: data.apellidoPaterno || '',
    apellidoMaterno: data.apellidoMaterno || '',
    correo: data.correo || '',
    role: data.role || 'usuario',
    telefono: data.telefono || '',
    domicilio: data.domicilio || '',
  };
}

module.exports = { getUser };
