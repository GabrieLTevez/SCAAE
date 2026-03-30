// ============================================================
// SCAEE — esqueci-senha.js
// ============================================================

const form    = document.getElementById('form-recuperar');
const msgErro = document.getElementById('msg-erro');
const msgOk   = document.getElementById('msg-ok');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgErro.hidden = true;
  msgOk.hidden   = true;

  const btn   = form.querySelector('button[type="submit"]');
  const email = document.getElementById('email').value.trim();

  btn.disabled    = true;
  btn.textContent = 'Enviando…';

  try {
    const res  = await fetch('/api/recuperacao/solicitar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      msgOk.textContent = '✓ ' + data.mensagem;
      msgOk.hidden = false;
      form.reset();
    } else {
      msgErro.textContent = '⚠ ' + (data.erro || 'Erro.');
      msgErro.hidden = false;
    }
  } catch {
    msgErro.textContent = '⚠ Erro de conexão.';
    msgErro.hidden = false;
  } finally {
    btn.disabled    = false;
    btn.textContent = 'ENVIAR INSTRUÇÕES';
  }
});
