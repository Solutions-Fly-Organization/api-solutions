const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { validateMessage } = require('../middleware');

// Middleware para anexar io ao request (será definido no app.js)
const attachIO = (req, res, next) => {
  req.io = req.app.get('io');
  next();
};

// Rotas para mensagens
router.get('/', MessageController.getMessages);
router.post('/',
    // validateMessage,
    // attachIO,
    MessageController.createMessage
);

// Rotas para API externa
router.post('/send-external', MessageController.sendMessageExternal);
router.get('/sessions', MessageController.listActiveSessions);
router.get('/session/:session/status', MessageController.getSessionStatus);
router.get('/chat/:chatId/info', MessageController.getChatInfo);

// Rotas de busca e estatísticas
router.get('/search', MessageController.searchMessages);
router.get('/stats/:roomId', MessageController.getRoomStats);
router.get('/stats', MessageController.getRoomStats);
router.get('/user/:userId', MessageController.getUserMessages);

// Rotas por ID (devem ficar por último para evitar conflitos)
router.get('/:id', MessageController.getMessage);
router.delete('/:id', attachIO, MessageController.deleteMessage);

module.exports = router;