# API de Chat - Consultório

Uma API de chat em tempo real com arquitetura MVC, construída com Node.js, Express e Socket.IO.

## 🏗️ Arquitetura

```
src/
├── controllers/     # Lógica de negócio
│   └── MessageController.js
├── models/         # Modelos de dados
│   ├── Message.js
│   └── MessageStore.js
├── routes/         # Definição de rotas
│   ├── index.js
│   └── messages.js
├── middleware/     # Middlewares personalizados
│   └── index.js
├── config/         # Configurações
│   └── socket.js
└── app.js          # Configuração do Express
```

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start
```

## 📡 Endpoints da API

### Mensagens

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/messages` | Listar mensagens |
| POST | `/api/messages` | Criar nova mensagem |
| GET | `/api/messages/:id` | Buscar mensagem por ID |
| DELETE | `/api/messages/:id` | Deletar mensagem |
| GET | `/api/messages/search` | Buscar mensagens por conteúdo |
| GET | `/api/messages/user/:userId` | Mensagens de um usuário |
| GET | `/api/messages/stats/:roomId?` | Estatísticas da sala |

### API Externa (WhatsApp/WAHA)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/messages/send-external` | Enviar mensagem via API externa |
| GET | `/api/messages/sessions` | Listar sessões ativas |
| GET | `/api/messages/session/:session/status` | Status de uma sessão |
| GET | `/api/messages/chat/:chatId/info` | Informações de um chat |

### Parâmetros de Query

- `roomId`: ID da sala (padrão: 'general')
- `limit`: Número máximo de mensagens (padrão: 50)
- `offset`: Offset para paginação (padrão: 0)
- `q`: Query para busca de mensagens

### Headers de Autenticação (Opcional)

```
x-user-id: ID do usuário
x-username: Nome do usuário
```

## 🔌 WebSocket Events

### Cliente → Servidor

- `joinRoom`: Entrar em uma sala
- `sendMessage`: Enviar mensagem
- `typing`: Indicar que está digitando

### Servidor → Cliente

- `newMessage`: Nova mensagem recebida
- `userJoined`: Usuário entrou na sala
- `userLeft`: Usuário saiu da sala
- `userTyping`: Usuário digitando
- `recentMessages`: Mensagens recentes da sala
- `roomUsers`: Lista de usuários online
- `messageDeleted`: Mensagem deletada

## 📝 Exemplos de Uso

### 1. Criar mensagem via REST

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-username: João" \
  -d '{"content": "Olá pessoal!", "roomId": "general"}'
```

### 2. Listar mensagens

```bash
curl "http://localhost:3000/api/messages?roomId=general&limit=10"
```

### 3. Buscar mensagens

```bash
curl "http://localhost:3000/api/messages/search?q=olá&roomId=general"
```

### 4. Enviar mensagem via API externa

```bash
curl -X POST http://localhost:3000/api/messages/send-external \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "5511999999999@c.us",
    "message": "Olá! Esta é uma mensagem via API externa",
    "session": "default"
  }'
```

### 5. Listar sessões ativas

```bash
curl http://localhost:3000/api/messages/sessions
```

### 6. WebSocket Client (JavaScript)

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

// Entrar em uma sala
socket.emit('joinRoom', {
  roomId: 'general',
  userId: 'user123',
  username: 'João'
});

// Enviar mensagem
socket.emit('sendMessage', {
  content: 'Olá pessoal!',
  roomId: 'general'
});

// Escutar novas mensagens
socket.on('newMessage', (message) => {
  console.log('Nova mensagem:', message);
});

// Escutar usuários entrando
socket.on('userJoined', (data) => {
  console.log(data.message);
});
```

## 🛡️ Recursos de Segurança

- **Rate Limiting**: 30 mensagens por minuto
- **Validação de dados**: Conteúdo obrigatório e tamanho limitado
- **Sanitização**: Remove scripts e tags HTML
- **CORS**: Configurado para aceitar requisições
- **Middleware de autenticação**: Suporte a headers personalizados

## 🎯 Funcionalidades

- ✅ Chat em tempo real com Socket.IO
- ✅ Múltiplas salas de chat
- ✅ Histórico de mensagens
- ✅ Busca por mensagens
- ✅ Indicador de digitação
- ✅ Lista de usuários online
- ✅ Validação e sanitização
- ✅ Rate limiting
- ✅ Logs de requisições
- ✅ Tratamento de erros

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=development
```

## 📊 Health Check

```bash
curl http://localhost:3000/api/health
```

## 🏃‍♂️ Começando

1. Clone/baixe o projeto
2. Execute `npm install`
3. Execute `npm run dev`
4. Acesse `http://localhost:3000/api`
5. Use um cliente WebSocket para testar o chat em tempo real

---

**Desenvolvido com ❤️ para facilitar comunicação em consultórios**