# Medical Association Website (Simple Version)

Versão simplificada do site da S.P.O., rodando sem frameworks complexos, sem Docker e sem banco de dados externo.

## Como Rodar

1. Certifique-se de ter **Python 3** instalado.
2. Navegue até a pasta `simple_app`:
   ```bash
   cd simple_app
   ```
3. Execute o servidor:
   ```bash
   python server.py
   ```
4. Abra no navegador: `http://localhost:8000`

## Estrutura

- **server.py**: Servidor HTTP Python nativo (sem Flask/FastAPI). Gerencia rotas e API.
- **data.json**: Banco de dados em arquivo único.
- **public/**: Arquivos do frontend (HTML, CSS, JS).

## Admin Padrão
- **User**: `admin@medassoc.com`
- **Pass**: `admin123`
