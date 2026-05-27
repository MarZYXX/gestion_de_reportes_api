const { admin, db } = require('../config/firebaseAdmin');

const severidades = new Set(['alta', 'media', 'baja']);

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseDate(value, fieldName) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw httpError(400, `${fieldName} no es una fecha valida`);
  }
  return admin.firestore.Timestamp.fromDate(date);
}

function parseLocation(value) {
  const latitud = Number(value && value.latitud);
  const longitud = Number(value && value.longitud);
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    throw httpError(400, 'La ubicacion es obligatoria');
  }
  return new admin.firestore.GeoPoint(latitud, longitud);
}

function validateSeverity(severidad) {
  if (!severidades.has(severidad)) {
    throw httpError(400, 'La severidad debe ser alta, media o baja');
  }
}

function toIso(value) {
  return value && typeof value.toDate === 'function'
    ? value.toDate().toISOString()
    : null;
}

function serializeReport(doc) {
  const data = doc.data();
  const ubicacion = data.ubicacion;
  return {
    id: doc.id,
    userId: data.userId || '',
    titulo: data.titulo || '',
    descripcion: data.descripcion || '',
    severidad: data.severidad || 'baja',
    fechaIncidente: toIso(data.fechaIncidente),
    horaHora: data.horaHora || 0,
    horaMinuto: data.horaMinuto || 0,
    ubicacion: {
      latitud: ubicacion ? ubicacion.latitude : 0,
      longitud: ubicacion ? ubicacion.longitude : 0,
    },
    urlsImagenes: data.urlsImagenes || [],
    contadorCorroboraciones: data.contadorCorroboraciones || 0,
    corroboradoPor: data.corroboradoPor || [],
    estaCompleto: Boolean(data.estaCompleto),
    fechaCreacion: toIso(data.fechaCreacion),
    fechaCompletado: toIso(data.fechaCompletado),
    severidadModificadaPorAdmin: Boolean(data.severidadModificadaPorAdmin),
    esFalso: Boolean(data.esFalso),
  };
}

async function getReportDocument(id) {
  const doc = await db.collection('reportes').doc(id).get();
  if (!doc.exists) {
    throw httpError(404, 'Reporte no encontrado');
  }
  return doc;
}

async function listReports(query, uid) {
  let snapshot;
  if (query.mios) {
    snapshot = await db.collection('reportes').where('userId', '==', uid).get();
  } else {
    snapshot = await db.collection('reportes').get();
  }

  let reports = snapshot.docs.map(serializeReport);
  if (query.severidad) {
    validateSeverity(query.severidad);
    reports = reports.filter((report) => report.severidad === query.severidad);
  }
  if (query.estado === 'pendiente') {
    reports = reports.filter(
      (report) => !report.estaCompleto && !report.esFalso,
    );
  } else if (query.estado === 'resuelto') {
    reports = reports.filter(
      (report) => report.estaCompleto && !report.esFalso,
    );
  } else if (query.estado === 'falso') {
    reports = reports.filter((report) => report.esFalso);
  } else if (query.estado) {
    throw httpError(400, 'Estado de reporte no valido');
  }

  if (query.orden === 'corroboraciones') {
    reports.sort(
      (a, b) => b.contadorCorroboraciones - a.contadorCorroboraciones,
    );
  } else {
    reports.sort(
      (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion),
    );
  }
  return reports;
}

async function getReport(id) {
  return serializeReport(await getReportDocument(id));
}

async function createReport(uid, body) {
  const titulo = String(body.titulo || '').trim();
  const descripcion = String(body.descripcion || '').trim();
  if (titulo.length < 5 || !descripcion) {
    throw httpError(400, 'Titulo y descripcion son obligatorios');
  }
  validateSeverity(body.severidad);

  const data = {
    userId: uid,
    titulo,
    descripcion,
    severidad: body.severidad,
    fechaIncidente: parseDate(body.fechaIncidente, 'fechaIncidente'),
    horaHora: Number(body.horaHora) || 0,
    horaMinuto: Number(body.horaMinuto) || 0,
    ubicacion: parseLocation(body.ubicacion),
    urlsImagenes: Array.isArray(body.urlsImagenes) ? body.urlsImagenes : [],
    contadorCorroboraciones: 0,
    corroboradoPor: [],
    estaCompleto: false,
    fechaCreacion: admin.firestore.Timestamp.now(),
    fechaCompletado: null,
    severidadModificadaPorAdmin: false,
    esFalso: false,
  };

  const ref = await db.collection('reportes').add(data);
  return getReport(ref.id);
}

async function updateReport(id, uid, body) {
  const doc = await getReportDocument(id);
  const report = doc.data();
  if (report.userId !== uid) {
    throw httpError(403, 'Solo puedes editar tus propios reportes');
  }
  if (report.estaCompleto || report.esFalso) {
    throw httpError(403, 'Un reporte cerrado no puede editarse');
  }

  const changes = {};
  if (body.titulo !== undefined) changes.titulo = String(body.titulo).trim();
  if (body.descripcion !== undefined) {
    changes.descripcion = String(body.descripcion).trim();
  }
  if (body.severidad !== undefined) {
    validateSeverity(body.severidad);
    changes.severidad = body.severidad;
  }
  if (body.fechaIncidente !== undefined) {
    changes.fechaIncidente = parseDate(body.fechaIncidente, 'fechaIncidente');
  }
  if (body.horaHora !== undefined) changes.horaHora = Number(body.horaHora);
  if (body.horaMinuto !== undefined) {
    changes.horaMinuto = Number(body.horaMinuto);
  }
  if (body.urlsImagenes !== undefined) {
    changes.urlsImagenes = Array.isArray(body.urlsImagenes)
      ? body.urlsImagenes
      : [];
  }
  if (Object.keys(changes).length === 0) {
    throw httpError(400, 'No hay campos permitidos para actualizar');
  }

  await doc.ref.update(changes);
  return getReport(id);
}

async function deleteReport(id, uid, isAdmin) {
  const doc = await getReportDocument(id);
  if (!isAdmin && doc.data().userId !== uid) {
    throw httpError(403, 'Solo puedes eliminar tus propios reportes');
  }
  await doc.ref.delete();
}

async function toggleCorroboration(id, uid) {
  const ref = db.collection('reportes').doc(id);
  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);
    if (!doc.exists) throw httpError(404, 'Reporte no encontrado');
    const corroboradoPor = [...(doc.data().corroboradoPor || [])];
    const index = corroboradoPor.indexOf(uid);
    if (index >= 0) {
      corroboradoPor.splice(index, 1);
    } else {
      corroboradoPor.push(uid);
    }
    transaction.update(ref, {
      corroboradoPor,
      contadorCorroboraciones: corroboradoPor.length,
    });
  });
  return getReport(id);
}

async function setSeverity(id, severidad) {
  validateSeverity(severidad);
  const doc = await getReportDocument(id);
  await doc.ref.update({
    severidad,
    severidadModificadaPorAdmin: true,
  });
  return getReport(id);
}

async function resolveReport(id) {
  const doc = await getReportDocument(id);
  await doc.ref.update({
    estaCompleto: true,
    esFalso: false,
    fechaCompletado: admin.firestore.Timestamp.now(),
  });
  return getReport(id);
}

async function rejectReport(id) {
  const doc = await getReportDocument(id);
  await doc.ref.update({
    estaCompleto: true,
    esFalso: true,
    fechaCompletado: admin.firestore.Timestamp.now(),
  });
  return getReport(id);
}

module.exports = {
  httpError,
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  toggleCorroboration,
  setSeverity,
  resolveReport,
  rejectReport,
};
