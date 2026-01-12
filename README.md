# Medical Association Website (S.P.O.)

Aplicação web completa desenvolvida para a Sociedade Paraense de Oftalmologia, com foco em segurança, performance e experiência do usuário.

---

## 🚀 Como Executar o Projeto

Para rodar este projeto em sua máquina local, siga as instruções abaixo.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:
- **Python 3.10+**: Para o backend.
- **Node.js 18+ (LTS)**: Para o frontend.
- **Git**: Para controle de versão.

### 1. Configuração do Backend

O backend utiliza **FastAPI** e **SQLite**.

1. **Navegue até a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Crie e ative um ambiente virtual:**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:
   ```env
   SECRET_KEY=sua_chave_secreta_aqui
   CORS_ORIGINS=http://localhost:3000
   ```

5. **Inicialize o Banco de Dados:**
   Execute o script para criar as tabelas e adicionar dados iniciais:
   ```bash
   python ../scripts/seed_doctors.py
   ```

6. **Inicie o Servidor:**
   ```bash
   uvicorn server:app --reload --port 8001
   ```
   O servidor estará rodando em `http://localhost:8001`.

### 2. Configuração do Frontend

O frontend é construído com **React**.

1. **Abra um novo terminal e navegue até a pasta do frontend:**
   ```bash
   cd frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou: yarn install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na pasta `frontend`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

4. **Inicie a aplicação:**
   ```bash
   npm start
   # ou: yarn start
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 🔒 Segurança e Arquitetura

O sistema foi desenvolvido seguindo boas práticas de segurança:

- **Autenticação Segura**: Utiliza JWT (JSON Web Tokens) com hash de senha bcrypt.
- **Proteção de Dados**: Banco de dados SQLite local, isolado da web pública.
- **Upload Seguro**: Validação rigorosa de tipos de arquivo (apenas imagens) e renomeação automática com UUIDs para prevenir ataques de path traversal.
- **Rate Limiting**: Proteção contra força bruta no endpoint de login (limite de 5 tentativas/minuto).
- **Cabeçalhos de Segurança**: Implementação de headers HTTP como `X-Content-Type-Options`, `X-Frame-Options` e proteção XSS.
- **CORS Configurado**: Restrição de origens permitidas para evitar requisições não autorizadas.

## 🛠️ Tecnologias Utilizadas

- **Backend**: FastAPI, SQLAlchemy (Async), Pydantic, SlowAPI.
- **Frontend**: React, TailwindCSS, Axios, Lucide Icons.
- **Banco de Dados**: SQLite (via aiosqlite).

## 👤 Credenciais de Acesso (Padrão)

Para acessar o painel administrativo:
- **Email**: `admin@medassoc.com`
- **Senha**: `admin123`

---

*Desenvolvido por Marcos Makosu & Pablo Silva*
