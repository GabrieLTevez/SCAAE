// ============================================================
// SCAEE — Rotas de eventos (Com trava de segurança por E-mail)
// ============================================================

const express = require('express');
const db      = require('../db');
const { requireLogin, requireTipo } = require('../middleware/auth');
const router  = express.Router();

// Todos os endpoints abaixo exigem login
router.use(requireLogin);

// GET /api/eventos — Lista todos os eventos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, u.email AS dono_original_email
       FROM eventos e
       LEFT JOIN usuario u ON u.id = e.criado_por
       ORDER BY e.startdate ASC, e.startime ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    res.status(500).json({ erro: 'Erro ao buscar eventos.' });
  }
});

// POST /api/eventos — Cadastra novo (Salva ID e Email de quem criou)
router.post('/', requireTipo('Gestão', 'Professor'), async (req, res) => {
  const { titulo, tipo, startdate, enddate, startime, endtime,
          local1, nome, base, ano, curso, coord, color, descricao } = req.body;

  // Validação básica
  if (!titulo || !tipo || !startdate || !startime) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO eventos
       (titulo, tipo, startdate, enddate, startime, endtime, local1, nome, base, ano, curso, coord, color, info_event, criado_por, criado_por_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, tipo, startdate, enddate, startime, endtime,
       local1, nome, base, ano, curso, coord, color, descricao,
       req.session.usuario.id, req.session.usuario.email]
    );
    res.status(201).json({ sucesso: true, id: result.insertId });
  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    res.status(500).json({ erro: 'Erro ao salvar evento.' });
  }
});

// PUT /api/eventos/:id — Editar (Apenas Gestão ou o próprio Criador)
router.put('/:id', requireTipo('Gestão', 'Professor'), async (req, res) => {
  const id = parseInt(req.params.id);
  const usuarioLogado = req.session.usuario;

  try {
    // Busca o dono do evento no banco
    const [rows] = await db.execute('SELECT criado_por_email FROM eventos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Evento não encontrado.' });

    const donoDoEvento = rows[0].criado_por_email;

    // REGRA: Se não for Gestão E o email não bater, bloqueia
    if (usuarioLogado.tipo !== 'Gestão' && donoDoEvento !== usuarioLogado.email) {
      return res.status(403).json({ erro: 'Você não tem permissão para editar este evento.' });
    }

    const { titulo, tipo, startdate, enddate, startime, endtime,
            local1, nome, base, ano, curso, coord, color, descricao } = req.body;

    await db.execute(
      `UPDATE eventos SET
        titulo=?, tipo=?, startdate=?, enddate=?, startime=?, endtime=?,
        local1=?, nome=?, base=?, ano=?, curso=?, coord=?, color=?, info_event=?
       WHERE id=?`,
      [titulo, tipo, startdate, enddate, startime, endtime,
       local1, nome, base, ano, curso, coord, color, descricao, id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao editar:', err);
    res.status(500).json({ erro: 'Erro ao editar evento.' });
  }
});

// DELETE /api/eventos/:id — Remover (Apenas Gestão ou o próprio Criador)
router.delete('/:id', requireTipo('Gestão', 'Professor'), async (req, res) => {
  const id = parseInt(req.params.id);
  const usuarioLogado = req.session.usuario;

  try {
    const [rows] = await db.execute('SELECT criado_por_email FROM eventos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Evento não encontrado.' });

    if (usuarioLogado.tipo !== 'Gestão' && rows[0].criado_por_email !== usuarioLogado.email) {
      return res.status(403).json({ erro: 'Você não tem permissão para excluir este evento.' });
    }

    await db.execute('DELETE FROM eventos WHERE id = ?', [id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao deletar:', err);
    res.status(500).json({ erro: 'Erro ao deletar evento.' });
  }
});

module.exports = router;