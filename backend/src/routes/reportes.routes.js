const express = require('express');
const reports = require('../controllers/reportes.controller');
const comments = require('../controllers/comentarios.controller');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

router.get('/mios', reports.mine);
router.get('/', reports.list);
router.post('/', reports.create);
router.get('/:id', reports.detail);
router.patch('/:id', reports.update);
router.delete('/:id', reports.remove);
router.post('/:id/corroborar', reports.corroborate);
router.get('/:id/comentarios', comments.list);
router.post('/:id/comentarios', comments.create);
router.patch('/:id/comentarios/:comentarioId', comments.update);
router.delete('/:id/comentarios/:comentarioId', comments.remove);

module.exports = router;
