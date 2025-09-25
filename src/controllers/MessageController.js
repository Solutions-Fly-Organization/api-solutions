const messageStore = require("../models/MessageStore");
const { apiClient, apiUtils } = require("../config/axios");

class MessageController {
  // Listar mensagens de uma sala
  async getMessages(req, res) {
    try {
      const { roomId = "general", limit = 50, offset = 0 } = req.query;

      const messages = messageStore.getByRoom(
        roomId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: messages,
        meta: {
          roomId,
          count: messages.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar mensagens",
        error: error.message,
      });
    }
  }

  // Criar nova mensagem
  async createMessage(req, res) {
    try {
      console.info("Criando nova mensagem com body:", req.body);

      // Usar as funções utilitárias do axios
      await apiUtils.sendSeen(
        req.body.payload?.from,
        req.body.payload?.id,
        req.body.session,
        null
      );

      await apiUtils.startTyping(req.body.payload?.from, req.body.session);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await apiUtils.stopTyping(req.body.payload?.from, req.body.session);

      await apiUtils.sendText(
        req.body.payload?.from,
        "Mensagem recebida com sucesso!",
        req.body.session
      );

      console.log("Resposta da API externa:", sendSeenResponse.data);

      res.status(200).json({
        success: true,
        message: "Mensagem processada com sucesso",
        externalApiResponse: response.data,
      });
    } catch (error) {
      console.error("Erro ao processar mensagem:", error.message);

      res.status(400).json({
        success: false,
        message: "Erro ao processar mensagem",
        error: error.message,
        details: error.response?.data || null,
      });
    }
  }

  // Buscar mensagem por ID
  async getMessage(req, res) {
    try {
      const { id } = req.params;
      const message = messageStore.findById(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Mensagem não encontrada",
        });
      }

      res.json({
        success: true,
        data: message.toJSON(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar mensagem",
        error: error.message,
      });
    }
  }

  // Deletar mensagem
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.user || { userId: null };

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      const deletedMessage = messageStore.delete(id, userId);

      // Emitir via WebSocket para outros clientes
      if (req.io) {
        req.io
          .to(deletedMessage.roomId)
          .emit("messageDeleted", { id: parseInt(id) });
      }

      res.json({
        success: true,
        message: "Mensagem deletada com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Buscar mensagens por usuário
  async getUserMessages(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      const messages = messageStore.getByUser(userId, parseInt(limit));

      res.json({
        success: true,
        data: messages,
        meta: {
          userId,
          count: messages.length,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar mensagens do usuário",
        error: error.message,
      });
    }
  }

  // Buscar mensagens por conteúdo
  async searchMessages(req, res) {
    try {
      const { q: query, roomId = "general", limit = 20 } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Query de busca é obrigatória",
        });
      }

      const messages = messageStore.search(query, roomId, parseInt(limit));

      res.json({
        success: true,
        data: messages,
        meta: {
          query,
          roomId,
          count: messages.length,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar mensagens",
        error: error.message,
      });
    }
  }

  // Obter estatísticas da sala
  async getRoomStats(req, res) {
    try {
      const { roomId } = req.params;
      const finalRoomId = roomId || "general";
      const stats = messageStore.getStats(finalRoomId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao obter estatísticas",
        error: error.message,
      });
    }
  }

  // Método auxiliar para enviar mensagem via API externa
  async sendExternalMessage(chatId, message, session) {
    try {
      const response = await apiUtils.withRetry(async () => {
        return await apiUtils.sendText(chatId, message, session);
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar mensagem externa:", error.message);
      throw new Error(`Falha ao enviar mensagem: ${error.message}`);
    }
  }

  // Método auxiliar para marcar mensagem como vista
  async markMessageAsSeen(chatId, messageId, session, participant = null) {
    try {
      const response = await apiUtils.withRetry(async () => {
        return await apiUtils.sendSeen(chatId, messageId, session, participant);
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar mensagem como vista:", error.message);
      throw new Error(`Falha ao marcar como vista: ${error.message}`);
    }
  }

  // Método auxiliar para verificar status da sessão
  async checkSessionStatus(session) {
    try {
      const response = await apiUtils.withRetry(async () => {
        return await apiUtils.getSessionStatus(session);
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar status da sessão:", error.message);
      throw new Error(`Falha ao verificar sessão: ${error.message}`);
    }
  }

  // Endpoint para enviar mensagem via API externa
  async sendMessageExternal(req, res) {
    try {
      const { chatId, message, session } = req.body;

      if (!chatId || !message || !session) {
        return res.status(400).json({
          success: false,
          message: "chatId, message e session são obrigatórios",
        });
      }

      const result = await this.sendExternalMessage(chatId, message, session);

      res.json({
        success: true,
        message: "Mensagem enviada com sucesso",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Endpoint para verificar status da sessão
  async getSessionStatus(req, res) {
    try {
      const { session } = req.params;

      if (!session) {
        return res.status(400).json({
          success: false,
          message: "Parâmetro session é obrigatório",
        });
      }

      const status = await this.checkSessionStatus(session);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Endpoint para listar sessões ativas
  async listActiveSessions(req, res) {
    try {
      const response = await apiUtils.withRetry(async () => {
        return await apiUtils.listSessions();
      });

      res.json({
        success: true,
        message: "Sessões ativas recuperadas com sucesso",
        data: response.data,
      });
    } catch (error) {
      console.error("Erro ao listar sessões:", error.message);
      res.status(500).json({
        success: false,
        message: "Erro ao listar sessões ativas",
        error: error.message,
      });
    }
  }

  // Endpoint para obter informações de um chat
  async getChatInfo(req, res) {
    try {
      const { chatId } = req.params;
      const { session } = req.query;

      if (!chatId || !session) {
        return res.status(400).json({
          success: false,
          message: "chatId e session são obrigatórios",
        });
      }

      const response = await apiUtils.withRetry(async () => {
        return await apiUtils.getChatInfo(chatId, session);
      });

      res.json({
        success: true,
        message: "Informações do chat recuperadas com sucesso",
        data: response.data,
      });
    } catch (error) {
      console.error("Erro ao obter informações do chat:", error.message);
      res.status(500).json({
        success: false,
        message: "Erro ao obter informações do chat",
        error: error.message,
      });
    }
  }
}

module.exports = new MessageController();
