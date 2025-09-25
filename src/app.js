const express = require('express');
const http = require('http');
const path = require('path');

// Importar rotas e middlewares
const routes = require('./routes');
const {
  corsMiddleware,
  requestLogger,
  authenticateUser,
  createRateLimit,
  errorHandler
} = require('./middleware');

// Criar aplicação Express
const app = express();

// Criar servidor HTTP (necessário para Socket.IO)
const server = http.createServer(app);

// Configurar middlewares globais
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/messages', createRateLimit(30, 60000)); // 30 mensagens por minuto

// Middleware de autenticação
app.use('/api', authenticateUser);

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Chat - Consultório',
    version: '1.0.0',
    documentation: '/api',
    websocket: 'Socket.IO habilitado'
  });
});

// Servir arquivos estáticos (para futuro frontend)
app.use('/static', express.static(path.join(__dirname, '../public')));

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

module.exports = { app, server };