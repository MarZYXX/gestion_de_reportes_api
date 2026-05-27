const service = require('../services/reportes.service');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const data = await service.listReports(req.query, req.user.uid);
    return success(res, 'Reportes obtenidos correctamente', data);
  } catch (error) {
    return next(error);
  }
}

async function mine(req, res, next) {
  try {
    const data = await service.listReports({ ...req.query, mios: true }, req.user.uid);
    return success(res, 'Reportes del usuario obtenidos correctamente', data);
  } catch (error) {
    return next(error);
  }
}

async function detail(req, res, next) {
  try {
    return success(
      res,
      'Reporte obtenido correctamente',
      await service.getReport(req.params.id),
    );
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    return success(
      res,
      'Reporte creado correctamente',
      await service.createReport(req.user.uid, req.body),
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
      'Reporte actualizado correctamente',
      await service.updateReport(req.params.id, req.user.uid, req.body),
    );
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteReport(req.params.id, req.user.uid, false);
    return success(res, 'Reporte eliminado correctamente', null);
  } catch (error) {
    return next(error);
  }
}

async function corroborate(req, res, next) {
  try {
    return success(
      res,
      'Corroboracion actualizada correctamente',
      await service.toggleCorroboration(req.params.id, req.user.uid),
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, mine, detail, create, update, remove, corroborate };
