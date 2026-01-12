# Guia Completo: Como Rodar o Site da S.P.O.

Bem-vindo! Este documento foi criado para te guiar passo a passo, mesmo que você nunca tenha rodado um site antes. Vamos configurar o site da **Sociedade Paraense de Oftalmologia** no seu computador.

---

## 1. O que você precisa antes de começar (Pré-requisitos)

Para o site funcionar no seu notebook, você precisa instalar dois programas fundamentais. Pense neles como o "motor" do carro.

### A. Python (Para o "Cérebro" do site)
O backend (a parte que processa dados) é feito em Python.
1. Baixe em: [python.org/downloads](https://www.python.org/downloads/)
2. **Importante:** Na instalação, marque a caixinha **"Add Python to PATH"**.

### B. Node.js (Para a "Cara" do site)
O frontend (a parte visual) precisa do Node.js.
1. Baixe em: [nodejs.org](https://nodejs.org/) (Baixe a versão **LTS** - Long Term Support).
2. Instale clicando em "Next" até o fim.

### C. Git (Para baixar o código)
1. Baixe em: [git-scm.com](https://git-scm.com/downloads)
2. Instale normalmente.

---

## 2. Baixando o Código (Clonagem)

Abra o "Prompt de Comando" (Windows) ou "Terminal" (Mac/Linux) e digite:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_CRIADA>
```
*(Substitua `<URL_DO_SEU_REPOSITORIO>` pelo link que você copiou do GitHub)*.

---

## 3. Configurando o Backend (O Servidor/API)

O backend é responsável por salvar os médicos, fazer login e guardar as fotos. Vamos ligá-lo.

1. **Abra um terminal** dentro da pasta `backend`.
   *(Dica: Se você estiver na raiz do projeto, digite `cd backend`)*.

2. **Crie um ambiente virtual** (isso evita bagunça no seu computador):
   ```bash
   python -m venv venv
   ```

3. **Ative o ambiente**:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
   *(Você verá um `(venv)` aparecer no começo da linha)*.

4. **Instale as ferramentas necessárias**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure a Segurança**:
   Crie um arquivo chamado `.env` dentro da pasta `backend` e cole isso:
   ```env
   SECRET_KEY=uma_senha_muito_longa_e_secreta_aqui_12345
   CORS_ORIGINS=http://localhost:3000
   ```

6. **Crie o Banco de Dados inicial** (Adiciona os médicos de exemplo):
   ```bash
   python ../scripts/seed_doctors.py
   ```

7. **Ligue o Servidor**:
   ```bash
   uvicorn server:app --reload --port 8001
   ```
   **Sucesso!** Se aparecer `Uvicorn running on http://0.0.0.0:8001`, o cérebro do site está vivo. **Não feche essa janela.**

---

## 4. Configurando o Frontend (A Tela do Site)

Agora vamos ligar a parte visual.

1. **Abra um NOVO terminal** (Deixe o outro rodando).
2. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```

3. **Instale as dependências** (pode demorar um pouquinho):
   ```bash
   npm install
   # ou se tiver yarn instalado: yarn install
   ```

4. **Configure a conexão**:
   Crie um arquivo `.env` na pasta `frontend` e cole:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

5. **Ligue o Site**:
   ```bash
   npm start
   # ou: yarn start
   ```

O site deve abrir automaticamente no seu navegador em `http://localhost:3000`.

---

## 5. Como Usar o Site

### Acesso Administrativo
Para adicionar médicos ou eventos, você precisa logar.
1. Clique no ícone de engrenagem/usuário no menu ou vá em `/login`.
2. **Email**: `admin@medassoc.com`
3. **Senha**: `admin123`

### Segurança Implementada (Para seu conhecimento)
O site foi blindado com técnicas modernas:
- **Criptografia**: As senhas são embaralhadas (hash) antes de serem salvas. Nem o dono do site consegue ler a senha real.
- **Proteção de Upload**: Só aceitamos imagens (`.jpg`, `.png`). Arquivos maliciosos (`.exe`, `.py`) são bloqueados.
- **Rate Limiting**: Se alguém tentar adivinhar a senha muitas vezes, o sistema bloqueia temporariamente (5 tentativas/minuto).
- **Banco de Dados Seguro**: Usamos SQLite local, que é rápido e seguro para este porte, sem expor portas na internet desnecessariamente.

---

## Resumo Rápido (Cheat Sheet)

Sempre que quiser rodar o site novamente:

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate
uvicorn server:app --reload --port 8001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Dúvidas? Entre em contato com o desenvolvedor!
