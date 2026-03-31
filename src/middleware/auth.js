// ============================================================
// SCAEE — Middleware de autenticação
// ============================================================

function requireLogin(req, res, next) {
  if (!req.session?.usuario) {
    // MUDANÇA AQUI: originalUrl pega a rota completa
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
    }
    return res.redirect('/login.html');
  }
  next();
}

function requireTipo(...tipos) {
  return (req, res, next) => {
    const tipo = req.session?.usuario?.tipo;
    if (!tipos.includes(tipo)) {
      return res.status(403).json({ erro: 'Acesso não permitido.' });
    }
    next();
  };
}

module.exports = { requireLogin, requireTipo };