const Message = require('./Message');

class MessageStore {
  constructor() {
    this.messages = [];
    this.nextId = 1;
  }

  // Criar nova mensagem
  create(content, userId, username, roomId = 'general') {
    const message = new Message(
      this.nextId++,
      content,
      userId,
      username,
      new Date(),
      roomId
    );

    // Sanitizar conteúdo
    message.sanitizeContent();

    // Validar mensagem
    if (!message.isValid()) {
      throw new Error('Mensagem inválida');
    }

    // Verificar tamanho
    if (message.isContentTooLong()) {
      throw new Error('Mensagem muito longa');
    }

    this.messages.push(message);
    return message;
  }

  // Listar todas as mensagens de uma sala
  getByRoom(roomId = 'general', limit = 50, offset = 0) {
    return this.messages
      .filter(message => message.roomId === roomId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit)
      .reverse(); // Retorna em ordem cronológica
  }

  // Buscar mensagem por ID
  findById(id) {
    return this.messages.find(message => message.id === parseInt(id));
  }

  // Deletar mensagem
  delete(id, userId) {
    const messageIndex = this.messages.findIndex(message => 
      message.id === parseInt(id) && message.userId === userId
    );

    if (messageIndex === -1) {
      throw new Error('Mensagem não encontrada ou sem permissão');
    }

    return this.messages.splice(messageIndex, 1)[0];
  }

  // Buscar mensagens por usuário
  getByUser(userId, limit = 20) {
    return this.messages
      .filter(message => message.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Buscar mensagens por conteúdo
  search(query, roomId = 'general', limit = 20) {
    return this.messages
      .filter(message => 
        message.roomId === roomId &&
        message.content.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Obter estatísticas
  getStats(roomId = 'general') {
    const roomMessages = this.messages.filter(message => message.roomId === roomId);
    const userCounts = {};

    roomMessages.forEach(message => {
      userCounts[message.username] = (userCounts[message.username] || 0) + 1;
    });

    return {
      totalMessages: roomMessages.length,
      activeUsers: Object.keys(userCounts).length,
      userMessageCounts: userCounts,
      lastMessage: roomMessages.length > 0 ? 
        roomMessages[roomMessages.length - 1].timestamp : null
    };
  }
}

// Singleton instance
const messageStore = new MessageStore();

module.exports = messageStore;