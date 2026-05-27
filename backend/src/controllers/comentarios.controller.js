const service = require('../services/comentarios.service');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    return success(
      res,
      'Comentarios obtenidos correctamente',
      await service.listComments(req.params.id),
    );
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    return success(
      res,
      'Comentario creado correctamente',
      await service.createComment(req.params.id, req.user.uid, req.body),
      201,
    );
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    return success(
      res,
      'Comentario actualizado correctamente',
      await service.updateComment(
        req.params.id,
        req.params.comentarioId,
        req.user.uid,
        false,
        req.body,
      ),
    );
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteComment(
      req.params.id,
      req.params.comentarioId,
      req.user.uid,
      false,
    );
    return success(res, 'Comentario eliminado correctamente', null);
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, update, remove };
