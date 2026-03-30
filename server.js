// ============================================================
// SCAEE — Servidor principal (Express)
// ============================================================

const express        = require('express');
const session        = require('express-session');
const cookieParser   = require('cookie-parser');
const path           = require('path');

const authRoutes        = require('./src/routes/auth');
const eventosRoutes     = require('./src/routes/eventos');
const recuperacaoRoutes = require('./src/routes/recuperacao');

const app  = express();
const PORT = 3000;

// ── Middlewares globais ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret:            'scaee-secret-troque-em-producao',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   false,   // true em produção com HTTPS
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 8, // 8 horas
  },
}));

// ── Arquivos estáticos (HTML, CSS, JS do frontend) ──────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Rotas da API ─────────────────────────────────────────────
app.use('/api',             authRoutes);
app.use('/api/eventos',     eventosRoutes);
app.use('/api/recuperacao', recuperacaoRoutes);

// ── Rota fallback — redireciona tudo para login ──────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ── Inicia o servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ SCAEE rodando em http://localhost:${PORT}`);
  console.log(`   Pressione Ctrl+C para parar.\n`);
});
