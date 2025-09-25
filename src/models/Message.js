class Message {
  constructor(id, content, userId, username, timestamp = new Date(), roomId = 'general') {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.username = username;
    this.timestamp = timestamp;
    this.roomId = roomId;
  }

  // Validar se a mensagem está completa
  isValid() {
    return this.content && 
           this.content.trim().length > 0 && 
           this.userId && 
           this.username;
  }

  // Converter para JSON
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      userId: this.userId,
      username: this.username,
      timestamp: this.timestamp,
      roomId: this.roomId
    };
  }

  // Sanitizar conteúdo da mensagem
  sanitizeContent() {
    if (this.content) {
      // Remove scripts e tags HTML perigosas
      this.content = this.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    return this;
  }

  // Verificar se a mensagem é muito longa
  isContentTooLong(maxLength = 1000) {
    return this.content && this.content.length > maxLength;
  }
}

module.exports = Message;