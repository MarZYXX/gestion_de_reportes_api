const reportService = require('../services/reportes.service');
const commentService = require('../services/comentarios.service');
const userService = require('../services/usuarios.service');
const { success } = require('../utils/response');

async function severity(req, res, next) {
  try {
    return success(
      res,
      'Severidad actualizada correctamente',
      await reportService.setSeverity(req.params.id, req.body.severidad),
    );
  } catch (error) {
    return next(error);
  }
}

async function resolve(req, res, next) {
  try {
    return success(
      res,
      'Reporte resuelto correctamente',
      await reportService.resolveReport(req.params.id),
    );
  } catch (error) {
    return next(error);
  }
}

async function reject(req, res, next) {
  try {
    return success(
      res,
      'Reporte marcado como falso correctamente',
      await reportService.rejectReport(req.params.id),
    );
  } catch (error) {
    return next(error);
  }
}

async function user(req, res, next) {
  try {
    return success(
      res,
      'Usuario obtenido correctamente',
      await userService.getUser(req.params.id),
    );
  } catch (error) {
    return next(error);
  }
}

async function updateComment(req, res, next) {
  try {
    return success(
      res,
      'Comentario moderado correctamente',
      await commentService.updateComment(
        req.params.id,
        req.params.comentarioId,
        req.user.uid,
        true,
        req.body,
      ),
    );
  } catch (error) {
    return next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    await commentService.deleteComment(
      req.params.id,
      req.params.comentarioId,
      req.user.uid,
      true,
    );
    return success(res, 'Comentario eliminado correctamente', null);
  } catch (error) {
    return next(error);
  }
}

async function deleteReport(req, res, next) {
  try {
    await reportService.deleteReport(req.params.id, req.user.uid, true);
    return success(res, 'Reporte eliminado correctamente', null);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  severity,
  resolve,
  reject,
  user,
  updateComment,
  deleteComment,
  deleteReport,
};
