// ============================================================
// SCAEE — recuperar-senha.js
// ============================================================

const form    = document.getElementById('form-nova-senha');
const msgErro = document.getElementById('msg-erro');
const msgOk   = document.getElementById('msg-ok');

// Pega o token da URL
const token = new URLSearchParams(location.search).get('token');
if (!token) {
  msgErro.textContent = '⚠ Link inválido ou expirado.';
  msgErro.hidden = false;
  form.style.display = 'none';
}

// Toggle visibilidade de senhas
document.querySelectorAll('.toggle-s').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    input.type  = input.type === 'password' ? 'text' : 'password';
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgErro.hidden = true;
  msgOk.hidden   = true;

  const btn    = form.querySelector('button[type="submit"]');
  const senha1 = document.getElementById('senha1').value;
  const senha2 = document.getElementById('senha2').value;

  if (senha1 !== senha2) {
    msgErro.textContent = '⚠ As senhas não coincidem.';
    msgErro.hidden = false;
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Salvando…';

  try {
    const res  = await fetch('/api/recuperacao/redefinir', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, senha1, senha2 }),
    });
    const data = await res.json();

    if (data.sucesso) {
      window.location.href = '/login.html?msg=senha_redefinida';
    } else {
      msgErro.textContent = '⚠ ' + (data.erro || 'Erro.');
      msgErro.hidden = false;
    }
  } catch {
    msgErro.textContent = '⚠ Erro de conexão.';
    msgErro.hidden = false;
  } finally {
    btn.disabled    = false;
    btn.textContent = 'SALVAR SENHA';
  }
});
