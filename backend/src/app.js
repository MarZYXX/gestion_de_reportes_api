const cors = require('cors');
const express = require('express');
const reportsRoutes = require('./routes/reportes.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/usuarios.routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { success } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  return success(res, 'API funcionando', null);
});

app.use('/api/reportes', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
