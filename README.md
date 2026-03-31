# SCAEE — Software de Cadastro e Armazenamento de Eventos Escolares

O SCAEE é uma solução Full Stack robusta desenvolvida para centralizar a gestão acadêmica de eventos. Mais do que um simples calendário, o sistema foi projetado com foco em segurança de dados, experiência do usuário (UX) e regras de negócio dinâmicas.

---

# Por que o SCAEE é diferente?
Diferente de soluções genéricas, o SCAEE foi construído pensando na hierarquia de uma instituição de ensino:

Controle de Acesso Granular (RBAC): Diferenciação real entre níveis de permissão (Gestão, Professor e Recepção).

Segurança de Sessão: Implementação de express-session com proteção contra ataques de fixação e cabeçalhos de controle de cache para evitar vazamento de dados em máquinas públicas.

Integridade de Dados: Validação no servidor (Backend) que impede que um usuário tente editar ou excluir eventos de terceiros via requisições diretas à API.

---

Stack: **Node.js + Express + MySQL**

---

## Funcionalidades Principais
👤 Gestão de Usuários
Login seguro com comparação de hash.

Recuperação de senha via tokens temporários.

Persistência de sessão com regeneração de ID para segurança.

---

## Painel Administrativo

Calendário Interativo: Renderização dinâmica de dias e eventos com indicadores visuais por cores (Interno, Aberto, Convidado).

Gestão de Eventos: CRUD completo com interface em "Drawer" (lateral) para melhor fluxo de trabalho.

Filtros em Tempo Real: Busca por nome, curso ou tipo sem necessidade de recarregar a página (Single Page Feeling).
## Pré-requisitos

- [Node.js](https://nodejs.org) v18 ou superior
- MySQL rodando (via XAMPP ou instalação nativa)

---

## Instalação

### 1. Banco de dados
Abra o phpMyAdmin (ou MySQL Workbench) e execute o arquivo:
```
dbscaee.sql
```
Isso cria o banco, as tabelas e os usuários de exemplo.

### 2. Dependências Node
Abra o terminal na pasta do projeto e rode:
```bash
npm install
```

### 3. Iniciar o servidor
```bash
# Modo normal:
npm start

# Modo desenvolvimento (reinicia automaticamente ao salvar):
npm run dev
```

### 4. Acessar
Abra o navegador em:
```
http://localhost:3000
```

---

## Usuários de exemplo

| E-mail                      | Senha  | Tipo      |
|-----------------------------|--------|-----------|
| gestao@escola.edu.br        | 123    | Gestão    |
| professor@escola.edu.br     | 123    | Professor |
| recepcao@escola.edu.br      | 123    | Recepção  |

---

## Estrutura do projeto

```
scaee/
├── server.js              ← Servidor Express (ponto de entrada)
├── package.json
├── dbscaee.sql            ← Schema do banco de dados
│
├── src/
│   ├── db.js              ← Conexão com MySQL
│   ├── middleware/
│   │   └── auth.js        ← Proteção de rotas (sessão)
│   └── routes/
│       ├── auth.js        ← POST /api/login, /api/logout, GET /api/sessao
│       ├── eventos.js     ← GET/POST /api/eventos, DELETE /api/eventos/:id
│       └── recuperacao.js ← POST /api/recuperacao/solicitar e /redefinir
│
└── public/                ← Frontend (servido pelo Express)
    ├── login.html
    ├── index.html
    ├── esqueci-senha.html
    ├── recuperar-senha.html
    ├── css/
    │   ├── login.css
    │   └── app.css
    └── js/
        ├── login.js
        ├── app.js
        ├── esqueci-senha.js
        └── recuperar-senha.js
```

---

## API

| Método | Rota                            | Acesso         | Descrição                  |
|--------|---------------------------------|----------------|----------------------------|
| POST   | /api/login                      | Público        | Faz login                  |
| POST   | /api/logout                     | Logado         | Faz logout                 |
| GET    | /api/sessao                     | Logado         | Retorna usuário da sessão  |
| GET    | /api/eventos                    | Logado         | Lista todos os eventos     |
| POST   | /api/eventos                    | Gestão/Prof    | Cadastra novo evento       |
| DELETE | /api/eventos/:id                | Gestão         | Exclui um evento           |
| POST   | /api/recuperacao/solicitar      | Público        | Solicita redefinição       |
| POST   | /api/recuperacao/redefinir      | Público        | Salva nova senha           |

## 👨 Autor

Desenvolvido por **João Gabriel Tevez** Estudante de Sistemas de Informação - UFU.

[LinkedIn](https://www.linkedin.com/in/joaogabrieltevez/) | [Portfólio](https://github.com/GabrieLTevez/SCAAE)