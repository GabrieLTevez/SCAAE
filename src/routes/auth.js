// ============================================================
// SCAEE — Rotas de autenticação
// ============================================================

const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const router  = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, senha, tipo, nome FROM usuario WHERE email = ? LIMIT 1',
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuario = rows[0];

    const senhaValida =
      await bcrypt.compare(senha, usuario.senha).catch(() => false)
      || usuario.senha === senha;

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // Associa os dados à sessão atual
    req.session.usuario = {
      id:    usuario.id,
      email: email.trim(),
      tipo:  usuario.tipo,
      nome:  usuario.nome || '',
    };

    // FORÇA a gravação da sessão na memória do servidor ANTES de responder
    req.session.save((err) => {
      if (err) {
        console.error('Erro ao salvar sessão:', err);
        return res.status(500).json({ erro: 'Erro interno ao criar sessão.' });
      }
      
      // Só manda o sinal verde pro frontend depois que o cookie estiver garantido
      res.json({ sucesso: true, tipo: usuario.tipo });
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno. Tente novamente.' });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ sucesso: true });
  });
});

// GET /api/sessao
router.get('/sessao', (req, res) => {
  // ATENÇÃO: Essa linha é vital para matar o cache maldito do navegador!
  res.set('Cache-Control', 'no-store');

  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ logado: false });
  }
  
  res.json({ logado: true, usuario: req.session.usuario });
});

module.exports = router;