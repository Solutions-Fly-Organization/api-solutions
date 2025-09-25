require('dotenv').config();

const { app, server } = require('./src/app');
const SocketHandler = require('./src/config/socket');

const PORT = process.env.PORT || 3000;

// Inicializar Socket.IO
const socketHandler = new SocketHandler(server);

// Armazenar instância do Socket.IO no app para uso em rotas
app.set('io', socketHandler.getIO());

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket habilitado para chat em tempo real`);
  console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
});