# Guia de Implantação (Deployment) - Hostinger VPS

Este projeto foi configurado para ser facilmente implantado em um servidor VPS (como Hostinger, DigitalOcean, AWS) utilizando **Docker**.

## Pré-requisitos no Servidor (VPS)

Acesse seu terminal VPS via SSH e instale o Docker:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install -y docker-compose
```

## Passo a Passo para o Deploy

1. **Clone o Repositório no VPS:**
   ```bash
   git clone <SEU_URL_DO_GITHUB>
   cd <NOME_DA_PASTA>
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz (onde está o `docker-compose.yml`):
   ```bash
   nano .env
   ```
   Cole o conteúdo abaixo (altere a chave secreta!):
   ```env
   SECRET_KEY=gere_uma_chave_segura_e_aleatoria_aqui
   CORS_ORIGINS=*
   PORT=8000
   ```
   *(Pressione Ctrl+X, Y, Enter para salvar)*

3. **Inicie a Aplicação:**
   ```bash
   sudo docker-compose up -d --build
   ```

## O que vai acontecer?
- O Docker vai construir o **Frontend (React)** e gerar os arquivos estáticos.
- O Docker vai configurar o **Backend (FastAPI)** com Python.
- O servidor irá iniciar na porta `8000`.
- O banco de dados SQLite será criado automaticamente e persistido na pasta `data/`.
- Os uploads serão salvos na pasta `uploads/`.

## Acessando o Site
Abra seu navegador e digite: `http://SEU_IP_DO_VPS:8000`

### Configuração de Domínio (Recomendado)
Para usar um domínio (ex: `spo-pa.com.br`) e HTTPS (cadeado de segurança), recomenda-se configurar o **Nginx** como proxy reverso e usar o **Certbot**.

---

## Desenvolvimento Local (Sem Docker)

Se quiser rodar no seu computador para testar antes de enviar:

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
