// ============================================================
// SCAEE — Rotas de recuperação de senha
// POST /api/recuperacao/solicitar
// POST /api/recuperacao/redefinir
// ============================================================

const express = require('express');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const db      = require('../db');
const router  = express.Router();

// POST /api/recuperacao/solicitar
router.post('/solicitar', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ erro: 'Informe o e-mail.' });

  try {
    const [rows] = await db.execute(
      'SELECT id FROM usuario WHERE email = ? LIMIT 1', [email.trim()]
    );

    if (rows.length > 0) {
      const token   = crypto.randomBytes(32).toString('hex');
      const expira  = new Date(Date.now() + 3600000); // 1 hora

      await db.execute(
        `INSERT INTO tokens_recuperacao (email, token, expira_em)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE token = VALUES(token), expira_em = VALUES(expira_em)`,
        [email.trim(), token, expira]
      );

      // Em produção: enviar e-mail com link contendo o token
      // Por enquanto loga no console para testes
      console.log(`\n[SCAEE] Token de recuperação para ${email}:`);
      console.log(`http://localhost:3000/recuperar-senha.html?token=${token}\n`);
    }

    // Sempre responde da mesma forma — não revela se o e-mail existe
    res.json({ sucesso: true, mensagem: 'Se o e-mail existir, você receberá as instruções.' });
  } catch (err) {
    console.error('Erro na recuperação:', err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

// POST /api/recuperacao/redefinir
router.post('/redefinir', async (req, res) => {
  const { token, senha1, senha2 } = req.body;

  if (!token || !senha1 || !senha2) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }
  if (senha1 !== senha2) {
    return res.status(400).json({ erro: 'As senhas não coincidem.' });
  }
  if (senha1.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const agora = new Date();
    const [rows] = await db.execute(
      'SELECT email FROM tokens_recuperacao WHERE token = ? AND expira_em > ? LIMIT 1',
      [token, agora]
    );

    if (rows.length === 0) {
      return res.status(400).json({ erro: 'Link inválido ou expirado.' });
    }

    const { email } = rows[0];
    const hash = await bcrypt.hash(senha1, 10);

    await db.execute('UPDATE usuario SET senha = ? WHERE email = ?', [hash, email]);
    await db.execute('DELETE FROM tokens_recuperacao WHERE token = ?', [token]);

    res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

module.exports = router;
