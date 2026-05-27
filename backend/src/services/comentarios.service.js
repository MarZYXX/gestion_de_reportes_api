const { admin, db } = require('../config/firebaseAdmin');
const { httpError } = require('./reportes.service');

function serializeComment(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId || '',
    texto: data.texto || '',
    fecha: data.fecha.toDate().toISOString(),
  };
}

async function assertReportExists(reportId) {
  const reportDoc = await db.collection('reportes').doc(reportId).get();
  if (!reportDoc.exists) {
    throw httpError(404, 'Reporte no encontrado');
  }
}

async function listComments(reportId) {
  await assertReportExists(reportId);
  const snapshot = await db
    .collection('reportes')
    .doc(reportId)
    .collection('comentarios')
    .orderBy('fecha', 'desc')
    .get();
  return snapshot.docs.map(serializeComment);
}

async function createComment(reportId, uid, body) {
  await assertReportExists(reportId);
  const texto = String(body.texto || '').trim();
  if (!texto) throw httpError(400, 'El comentario no puede estar vacio');
  const ref = await db
    .collection('reportes')
    .doc(reportId)
    .collection('comentarios')
    .add({
      userId: uid,
      texto,
      fecha: admin.firestore.Timestamp.now(),
    });
  return serializeComment(await ref.get());
}

async function updateComment(reportId, commentId, uid, isAdmin, body) {
  const ref = db
    .collection('reportes')
    .doc(reportId)
    .collection('comentarios')
    .doc(commentId);
  const doc = await ref.get();
  if (!doc.exists) throw httpError(404, 'Comentario no encontrado');
  if (!isAdmin && doc.data().userId !== uid) {
    throw httpError(403, 'Solo puedes editar tus propios comentarios');
  }
  const texto = String(body.texto || '').trim();
  if (!texto) throw httpError(400, 'El comentario no puede estar vacio');
  await ref.update({ texto });
  return serializeComment(await ref.get());
}

async function deleteComment(reportId, commentId, uid, isAdmin) {
  const ref = db
    .collection('reportes')
    .doc(reportId)
    .collection('comentarios')
    .doc(commentId);
  const doc = await ref.get();
  if (!doc.exists) throw httpError(404, 'Comentario no encontrado');
  if (!isAdmin && doc.data().userId !== uid) {
    throw httpError(403, 'Solo puedes eliminar tus propios comentarios');
  }
  await ref.delete();
}

module.exports = {
  listComments,
  createComment,
  updateComment,
  deleteComment,
};
