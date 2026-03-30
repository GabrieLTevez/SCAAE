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

    // Destrói sessão antiga e cria uma nova — garante que está salva antes de responder
    req.session.destroy(async () => {
      req.session.regenerate((errRegen) => {
        if (errRegen) {
          console.error('Erro ao regenerar sessão:', errRegen);
          return res.status(500).json({ erro: 'Erro interno.' });
        }

        req.session.usuario = {
          id:    usuario.id,
          email: email.trim(),
          tipo:  usuario.tipo,
          nome:  usuario.nome || '',
        };

        // Força o salvamento da sessão antes de responder
        req.session.save((errSave) => {
          if (errSave) {
            console.error('Erro ao salvar sessão:', errSave);
            return res.status(500).json({ erro: 'Erro interno.' });
          }
          res.json({ sucesso: true, tipo: usuario.tipo });
        });
      });
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
  if (!req.session?.usuario) {
    return res.status(401).json({ logado: false });
  }
  res.json({ logado: true, usuario: req.session.usuario });
});

module.exports = router;
