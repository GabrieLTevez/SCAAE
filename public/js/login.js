// ============================================================
// SCAEE — login.js
// ============================================================

const form     = document.getElementById('form-login');
const msgErro  = document.getElementById('msg-erro');
const msgOk    = document.getElementById('msg-ok');
const btnTexto = document.getElementById('btn-texto');
const btnLoader= document.getElementById('btn-loader');
const btnEntrar= document.getElementById('btn-entrar');

// Toggle senha
document.getElementById('toggle-senha')?.addEventListener('click', () => {
  const input = document.getElementById('senha');
  input.type  = input.type === 'password' ? 'text' : 'password';
});

// Exibe mensagem de sucesso se vier de redefinição
const params = new URLSearchParams(location.search);
if (params.get('msg') === 'senha_redefinida') {
  mostrarOk('Senha redefinida com sucesso! Faça login.');
}

// Submissão do login
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  esconderAvisos();
  setCarregando(true);

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  try {
    const res  = await fetch('/api/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (res.ok && data.sucesso) {
      // Redireciona para o painel
      window.location.href = '/index.html';
    } else {
      mostrarErro(data.erro || 'Erro ao fazer login.');
    }
  } catch {
    mostrarErro('Erro de conexão. Verifique se o servidor está rodando.');
  } finally {
    setCarregando(false);
  }
});

function setCarregando(ativo) {
  btnEntrar.disabled  = ativo;
  btnTexto.hidden     = ativo;
  btnLoader.hidden    = !ativo;
}

function esconderAvisos() {
  msgErro.hidden = true;
  msgOk.hidden   = true;
}

function mostrarErro(txt) {
  msgErro.textContent = '⚠ ' + txt;
  msgErro.hidden = false;
}

function mostrarOk(txt) {
  msgOk.textContent = '✓ ' + txt;
  msgOk.hidden = false;
}
