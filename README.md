# SCAEE — Software de Cadastro e Armazenamento de Eventos Escolares

Stack: **Node.js + Express + MySQL**

---

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
| gestao@escola.edu.br        | 123456 | Gestão    |
| professor@escola.edu.br     | 123456 | Professor |
| recepcao@escola.edu.br      | 123456 | Recepção  |

> **Atenção:** troque as senhas antes de usar em produção!

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
