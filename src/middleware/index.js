// Middleware para validação de dados das mensagens
const validateMessage = (req, res, next) => {
  const { content } = req.body;

  // Verificar se o conteúdo existe
  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Conteúdo da mensagem é obrigatório'
    });
  }

  // Verificar se não está vazio
  if (content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Mensagem não pode estar vazia'
    });
  }

  // Verificar tamanho máximo
  if (content.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Mensagem muito longa (máximo 1000 caracteres)'
    });
  }

  next();
};

// Middleware básico de autenticação (simulado)
const authenticateUser = (req, res, next) => {
  // Em uma aplicação real, você validaria um token JWT aqui
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'];
  const username = req.headers['x-username'];

  // Simulação básica - em produção use JWT ou sessões reais
  if (userId && username) {
    req.user = {
      userId,
      username
    };
  } else {
    // Para fins de desenvolvimento, criar usuário anônimo
    req.user = {
      userId: `anon_${Date.now()}`,
      username: `Usuário${Math.floor(Math.random() * 1000)}`
    };
  }

  next();
};

// Middleware de rate limiting simples
const createRateLimit = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Limpar requests antigos
    if (requests.has(identifier)) {
      const userRequests = requests.get(identifier);
      requests.set(identifier, userRequests.filter(time => now - time < windowMs));
    }

    // Verificar limite
    const userRequests = requests.get(identifier) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns instantes.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Adicionar nova requisição
    userRequests.push(now);
    requests.set(identifier, userRequests);

    next();
  };
};

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log da requisição
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Interceptar resposta para log
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    originalSend.call(this, data);
  };

  next();
};

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.errors
    });
  }

  // Erro de autorização
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado'
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

// Middleware para CORS
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-username');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

module.exports = {
  validateMessage,
  authenticateUser,
  createRateLimit,
  requestLogger,
  errorHandler,
  corsMiddleware
};