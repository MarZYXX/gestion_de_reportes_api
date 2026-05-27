const express = require('express');
const service = require('../services/usuarios.service');
const { authenticate } = require('../middleware/authMiddleware');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    return success(
      res,
      'Perfil obtenido correctamente',
      await service.getUser(req.user.uid),
    );
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
