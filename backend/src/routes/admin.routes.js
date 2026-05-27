const express = require('express');
const admin = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.patch('/reportes/:id/severidad', admin.severity);
router.patch('/reportes/:id/resolver', admin.resolve);
router.patch('/reportes/:id/falso', admin.reject);
router.delete('/reportes/:id', admin.deleteReport);
router.patch(
  '/reportes/:id/comentarios/:comentarioId',
  admin.updateComment,
);
router.delete(
  '/reportes/:id/comentarios/:comentarioId',
  admin.deleteComment,
);
router.get('/usuarios/:id', admin.user);

module.exports = router;
