// ============================================================
// SCAEE — app.js (Versão Final com Permissões)
// ============================================================

const CORES = { Interno: '#7F1CE2', Aberto: '#00c16a', Convidado: '#4395D0' };

let sessao         = null;
let todosEventos   = [];
let mesAtual       = new Date();
let diaSelecionado = null;
let filtroAtual    = 'todos';
let viewAtual      = 'calendario'; // 'calendario' | 'gestao'
let editandoId     = null;         // null = cadastro, número = edição

// ── Início ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await verificarSessao();
  await carregarEventos();
  configurarFiltros();
  configurarFormulario();
  configurarDrawer();
  configurarNav();
  configurarGestao();
  atualizarDataHoje();
});

// ── Sessão e Permissões ──────────────────────────────────────
async function verificarSessao() {
  try {
    const res = await fetch('/api/sessao');
    if (!res.ok) { window.location.href = '/login.html'; return; }
    
    const data = await res.json();
    if (!data.logado) { window.location.href = '/login.html'; return; }

    sessao = data.usuario;
    
    // Atualiza elementos da UI com segurança (evita o erro de elemento nulo)
    const elEmail  = document.getElementById('usuario-email');
    const elNome   = document.getElementById('usuario-nome');
    const elTipo   = document.getElementById('usuario-tipo');
    const elAvatar = document.getElementById('avatar-inicial');

    if (elEmail)  elEmail.textContent  = sessao.email;
    if (elNome)   elNome.textContent   = sessao.nome;
    if (elTipo)   elTipo.textContent   = sessao.tipo;
    if (elAvatar) elAvatar.textContent = sessao.email[0].toUpperCase();

    // Botão "Novo Evento" — Visível para Gestão e Professor
    const btnNovo = document.getElementById('btn-abrir-form');
    if (btnNovo && ['Gestão', 'Professor'].includes(sessao.tipo)) {
      btnNovo.hidden = false;
      btnNovo.style.display = 'flex';
    }

    // Aba "Gestão de Eventos" — Visível para Gestão e Professor
    const navGestao = document.getElementById('nav-gestao');
    if (navGestao && ['Gestão', 'Professor'].includes(sessao.tipo)) {
      navGestao.hidden = false;
      navGestao.style.display = 'flex';
    }

  } catch (erro) {
    console.error('Erro na sessão:', erro);
    window.location.href = '/login.html';
  }
}

document.getElementById('btn-sair')?.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

// ── Busca de Dados ───────────────────────────────────────────
async function carregarEventos() {
  try {
    const res = await fetch('/api/eventos');
    if (!res.ok) throw new Error();
    todosEventos = await res.json();
    
    renderizarCalendario();
    renderizarPainel();
    renderizarTabela();
  } catch {
    const lista = document.getElementById('eventos-lista');
    if (lista) lista.innerHTML = '<div class="vazio">Erro ao carregar eventos.</div>';
  }
}

// ── Navegação ────────────────────────────────────────────────
function configurarNav() {
  document.querySelectorAll('.nav-item[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      trocarView(link.dataset.view);
    });
  });
}

function trocarView(view) {
  viewAtual = view;
  document.querySelectorAll('.nav-item[data-view]').forEach(l => l.classList.remove('ativo'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('ativo');

  document.getElementById('view-calendario').hidden = (view !== 'calendario');
  document.getElementById('view-gestao').hidden      = (view !== 'gestao');

  const titulos = { calendario: 'Calendário de Eventos', gestao: 'Gestão de Eventos' };
  document.getElementById('topbar-titulo').textContent = titulos[view] ?? '';
}

// ── Calendário ───────────────────────────────────────────────
function renderizarCalendario() {
  const grid   = document.getElementById('cal-grid');
  const titulo = document.getElementById('cal-titulo');
  if (!grid || !titulo) return;

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  titulo.textContent = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const ultimoDia   = new Date(ano, mes + 1, 0).getDate();
  const hoje        = new Date();
  const ultimoAntes = new Date(ano, mes, 0).getDate();

  grid.innerHTML = '';

  for (let i = primeiroDia - 1; i >= 0; i--) {
    grid.appendChild(criarCelula(ultimoAntes - i, new Date(ano, mes - 1, ultimoAntes - i), true));
  }

  for (let d = 1; d <= ultimoDia; d++) {
    const data = new Date(ano, mes, d);
    const cel  = criarCelula(d, data, false);

    if (isMesmoDia(data, hoje)) cel.classList.add('hoje');
    if (diaSelecionado && isMesmoDia(data, diaSelecionado)) cel.classList.add('selecionado');

    const eventosNoDia = getEventosNoDia(data);
    if (eventosNoDia.length > 0) {
      const pontos = document.createElement('div');
      pontos.className = 'cal-pontos';
      eventosNoDia.slice(0, 4).forEach(ev => {
        const p = document.createElement('div');
        p.className = 'cal-ponto';
        p.style.background = CORES[ev.tipo] ?? '#888';
        pontos.appendChild(p);
      });
      cel.appendChild(pontos);
    }

    cel.addEventListener('click', () => selecionarDia(data));
    grid.appendChild(cel);
  }
}

function criarCelula(numero, data, outroMes) {
  const cel = document.createElement('div');
  cel.className = 'cal-dia' + (outroMes ? ' outro-mes' : '');
  const num = document.createElement('span');
  num.className   = 'cal-num';
  num.textContent = numero;
  cel.appendChild(num);
  return cel;
}

function selecionarDia(data) {
  diaSelecionado = data;
  renderizarCalendario();
  renderizarPainel();
}

document.getElementById('cal-prev')?.addEventListener('click', () => {
  mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1);
  renderizarCalendario();
});
document.getElementById('cal-next')?.addEventListener('click', () => {
  mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
  renderizarCalendario();
});

// ── Painel Lateral (Calendário) ──────────────────────────────
function renderizarPainel() {
  const lista  = document.getElementById('eventos-lista');
  const titulo = document.getElementById('painel-titulo');
  if (!lista) return;

  let eventos = todosEventos;

  if (diaSelecionado) {
    titulo.textContent = diaSelecionado.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    eventos = getEventosNoDia(diaSelecionado);
  } else {
    titulo.textContent = 'Todos os eventos';
  }

  if (filtroAtual !== 'todos') eventos = eventos.filter(e => e.tipo === filtroAtual);

  if (eventos.length === 0) {
    lista.innerHTML = diaSelecionado ? '<div class="vazio">Nenhum evento neste dia.</div>' : '<div class="vazio">Clique em um dia.</div>';
    return;
  }

  lista.innerHTML = eventos.map((e, i) => {
    // REGRA DE PERMISSÃO: Dono do evento ou Gestor
    const podeEditar = sessao?.tipo === 'Gestão' || e.criado_por_email === sessao?.email;

    return `
    <div class="evento-card" style="border-left-color:${CORES[e.tipo] ?? '#888'}; animation-delay:${i * 30}ms">
      <div class="evento-titulo">${escapar(e.titulo)}</div>
      <div class="evento-meta">
        <span>⏰ ${e.startime.slice(0, 5)} – ${e.endtime.slice(0, 5)}</span>
        <span>📍 ${escapar(e.local1)}</span>
        <span>👤 ${escapar(e.nome)}</span>
        <span>📚 ${escapar(e.curso)} · ${escapar(e.ano)}</span>
      </div>
      ${podeEditar ? `
      <div class="evento-acoes">
        <button class="btn-editar" data-id="${e.id}">✏ Editar</button>
        <button class="btn-deletar" data-id="${e.id}">✕ Excluir</button>
      </div>` : ''}
    </div>`;
  }).join('');

  lista.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', () => abrirEdicao(Number(btn.dataset.id))));
  lista.querySelectorAll('.btn-deletar').forEach(btn => btn.addEventListener('click', () => deletarEvento(Number(btn.dataset.id))));
}

function getEventosNoDia(data) {
  const iso = isoDate(data);
  return todosEventos.filter(e => {
    const start = e.startdate.split('T')[0];
    const end   = e.enddate.split('T')[0];
    return iso >= start && iso <= end;
  });
}

// ── Filtros ──────────────────────────────────────────────────
function configurarFiltros() {
  document.querySelectorAll('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      filtroAtual = btn.dataset.filtro;
      renderizarPainel();
    });
  });
}

// ── Tabela de Gestão ─────────────────────────────────────────
function configurarGestao() {
  document.getElementById('gestao-busca')?.addEventListener('input', renderizarTabela);
  document.getElementById('gestao-filtro-tipo')?.addEventListener('change', renderizarTabela);
}

function renderizarTabela() {
  const tbody   = document.getElementById('tabela-body');
  if (!tbody) return;
  
  const busca   = document.getElementById('gestao-busca').value.toLowerCase();
  const tipoFil = document.getElementById('gestao-filtro-tipo').value;

  let eventos = todosEventos;
  if (tipoFil) eventos = eventos.filter(e => e.tipo === tipoFil);
  if (busca)   eventos = eventos.filter(e => e.titulo.toLowerCase().includes(busca) || e.nome.toLowerCase().includes(busca));

  if (eventos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="tabela-vazio">Nenhum evento encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = eventos.map(e => {
    const podeEditar = sessao?.tipo === 'Gestão' || e.criado_por_email === sessao?.email;

    return `
    <tr>
      <td><span class="tabela-tipo ${e.tipo}">${e.tipo}</span></td>
      <td><strong>${escapar(e.titulo)}</strong></td>
      <td>${formatarData(e.startdate)}</td>
      <td>${e.startime.slice(0, 5)} – ${e.endtime.slice(0, 5)}</td>
      <td>${escapar(e.local1)}</td>
      <td>${escapar(e.nome)}</td>
      <td>${escapar(e.curso)}</td>
      <td>
        <div class="tabela-acoes">
          ${podeEditar ? `
            <button class="btn-editar" data-id="${e.id}">✏ Editar</button>
            <button class="btn-deletar" data-id="${e.id}">✕</button>
          ` : '<small style="color:gray">Apenas leitura</small>'}
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', () => abrirEdicao(Number(btn.dataset.id))));
  tbody.querySelectorAll('.btn-deletar').forEach(btn => btn.addEventListener('click', () => deletarEvento(Number(btn.dataset.id))));
}

// ── Edição e Exclusão ────────────────────────────────────────
function abrirEdicao(id) {
  const ev = todosEventos.find(e => e.id === id);
  if (!ev) return;
  editandoId = id;

  document.getElementById('evento-id').value  = ev.id;
  document.getElementById('titulo').value     = ev.titulo;
  document.getElementById('startdate').value  = ev.startdate.split('T')[0];
  document.getElementById('enddate').value    = ev.enddate.split('T')[0];
  document.getElementById('startime').value   = ev.startime.slice(0, 5);
  document.getElementById('endtime').value    = ev.endtime.slice(0, 5);
  document.getElementById('local1').value     = ev.local1;
  document.getElementById('nome').value       = ev.nome;
  document.getElementById('base').value       = ev.base;
  document.getElementById('ano').value        = ev.ano;
  document.getElementById('coord').value      = ev.coord;
  document.getElementById('curso').value      = ev.curso;
  document.getElementById('descricao').value  = ev.info_event;
  document.getElementById('color').value      = ev.color;

  document.querySelectorAll('.radio-tipo').forEach(r => r.checked = (r.value === ev.tipo));
  document.getElementById('drawer').style.borderLeftColor = CORES[ev.tipo] ?? '';
  document.getElementById('drawer-titulo').textContent = 'Editar Evento';
  document.getElementById('btn-confirmar').textContent = 'Salvar Alterações';

  abrirDrawer();
}

async function deletarEvento(id) {
  if (!confirm('Excluir este evento permanentemente?')) return;
  try {
    const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.sucesso) {
      todosEventos = todosEventos.filter(e => e.id !== id);
      renderizarCalendario(); renderizarPainel(); renderizarTabela();
      toast('Evento excluído.', 'sucesso');
    } else {
      toast(data.erro || 'Erro ao excluir.', 'erro');
    }
  } catch { toast('Erro de conexão.', 'erro'); }
}

// ── Drawer e Formulário ──────────────────────────────────────
function abrirDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  drawer.hidden = false;
  setTimeout(() => { drawer.classList.add('aberto'); overlay.classList.add('ativo'); }, 10);
}

function fecharDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  drawer.classList.remove('aberto');
  overlay.classList.remove('ativo');
  setTimeout(() => { drawer.hidden = true; }, 400);
  document.getElementById('form-evento').reset();
  editandoId = null;
}

function configurarDrawer() {
  document.getElementById('btn-abrir-form')?.addEventListener('click', abrirDrawer);
  document.getElementById('btn-fechar-form')?.addEventListener('click', fecharDrawer);
  document.getElementById('btn-cancelar')?.addEventListener('click', fecharDrawer);
  document.getElementById('overlay')?.addEventListener('click', fecharDrawer);

  document.querySelectorAll('.radio-tipo').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('drawer').style.borderLeftColor = CORES[r.value] ?? '';
      document.getElementById('color').value = CORES[r.value] ?? '';
    });
  });
}

function configurarFormulario() {
  const form = document.getElementById('form-evento');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-confirmar');
    btn.disabled = true; btn.textContent = 'Salvando...';

    const dados = Object.fromEntries(new FormData(form).entries());
    const isEdicao = !!editandoId;

    try {
      const res = await fetch(isEdicao ? `/api/eventos/${editandoId}` : '/api/eventos', {
        method: isEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const data = await res.json();

      if (data.sucesso) {
        toast(isEdicao ? 'Atualizado!' : 'Cadastrado!', 'sucesso');
        fecharDrawer(); await carregarEventos();
      } else {
        toast(data.erro || 'Erro ao salvar.', 'erro');
      }
    } catch { toast('Erro de conexão.', 'erro'); }
    finally { btn.disabled = false; btn.textContent = isEdicao ? 'Salvar Alterações' : 'Confirmar'; }
  });
}

// ── Utilitários ──────────────────────────────────────────────
function isMesmoDia(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isoDate(data) { return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`; }
function formatarData(str) { if (!str) return ''; const [a, m, d] = str.split('T')[0].split('-'); return `${d}/${m}/${a}`; }
function atualizarDataHoje() {
  const el = document.getElementById('data-hoje');
  if (el) el.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function escapar(str) { return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function toast(msg, tipo = 'info') {
  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('visivel'), 10);
  setTimeout(() => { t.classList.remove('visivel'); t.addEventListener('transitionend', () => t.remove()); }, 3000);
}