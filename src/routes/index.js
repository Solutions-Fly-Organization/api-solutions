const express = require('express');
const router = express.Router();

// Importar rotas específicas
const messagesRoutes = require('./messages');

// Definir rotas
router.use('/messages', messagesRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Chat - Consultório',
    version: '1.0.0',
    endpoints: {
      messages: '/api/messages',
      health: '/api/health'
    }
  });
});

module.exports = router;