// ============================================================
// SCAEE — Rotas de eventos
// GET    /api/eventos         — lista todos
// POST   /api/eventos         — cadastra novo
// DELETE /api/eventos/:id     — remove (apenas Gestão)
// ============================================================

const express = require('express');
const db      = require('../db');
const { requireLogin, requireTipo } = require('../middleware/auth');
const router  = express.Router();

// Todos os endpoints abaixo exigem login
router.use(requireLogin);

// GET /api/eventos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, u.email AS criado_por_email
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

// POST /api/eventos
router.post('/', requireTipo('Gestão', 'Professor'), async (req, res) => {
  const campos = ['titulo', 'tipo', 'startdate', 'enddate', 'startime', 'endtime',
                  'local1', 'nome', 'base', 'ano', 'curso', 'coord', 'color', 'descricao'];

  for (const campo of campos) {
    if (!req.body[campo]?.trim()) {
      return res.status(400).json({ erro: `Campo obrigatório ausente: ${campo}` });
    }
  }

  const { titulo, tipo, startdate, enddate, startime, endtime,
          local1, nome, base, ano, curso, coord, color, descricao } = req.body;

  if (enddate < startdate) {
    return res.status(400).json({ erro: 'A data final não pode ser anterior à data inicial.' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO eventos
       (titulo, tipo, startdate, enddate, startime, endtime, local1, nome, base, ano, curso, coord, color, info_event, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, tipo, startdate, enddate, startime, endtime,
       local1, nome, base, ano, curso, coord, color, descricao,
       req.session.usuario.id]
    );
    res.status(201).json({ sucesso: true, id: result.insertId });
  } catch (err) {
    console.error('Erro ao cadastrar evento:', err);
    res.status(500).json({ erro: 'Erro ao salvar evento.' });
  }
});

// PUT /api/eventos/:id — apenas Gestão
router.put('/:id', requireTipo('Gestão'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ erro: 'ID inválido.' });

  const campos = ['titulo', 'tipo', 'startdate', 'enddate', 'startime', 'endtime',
                  'local1', 'nome', 'base', 'ano', 'curso', 'coord', 'color', 'descricao'];

  for (const campo of campos) {
    if (!req.body[campo]?.trim()) {
      return res.status(400).json({ erro: `Campo obrigatório ausente: ${campo}` });
    }
  }

  const { titulo, tipo, startdate, enddate, startime, endtime,
          local1, nome, base, ano, curso, coord, color, descricao } = req.body;

  if (enddate < startdate) {
    return res.status(400).json({ erro: 'A data final não pode ser anterior à data inicial.' });
  }

  try {
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
    console.error('Erro ao editar evento:', err);
    res.status(500).json({ erro: 'Erro ao editar evento.' });
  }
});

// DELETE /api/eventos/:id  — apenas Gestão
router.delete('/:id', requireTipo('Gestão'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    await db.execute('DELETE FROM eventos WHERE id = ?', [id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao deletar evento:', err);
    res.status(500).json({ erro: 'Erro ao deletar evento.' });
  }
});

module.exports = router;
