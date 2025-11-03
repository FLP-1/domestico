# Documentação da API - Sistema DOM

**Versão:** 1.0.0  
**Base URL:** `https://api.sistemadom.com` (produção) ou `http://localhost:3000` (desenvolvimento)

## Autenticação

Todas as rotas protegidas requerem um token JWT no header `Authorization`:

```
Authorization: Bearer {token}
```

O token é obtido através do endpoint de login e tem validade de 24 horas.

---

## Endpoints

### Autenticação

#### POST /api/auth/login

Autentica um usuário e retorna um token JWT.

**Rate Limit:** 5 requisições por 15 minutos

**Request Body:**
```json
{
  "cpf": "12345678901",
  "senha": "senha123",
  "locationData": {
    "latitude": -23.550520,
    "longitude": -46.633308,
    "accuracy": 10
  }
}
```

**Response 200 (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "cpf": "12345678901",
    "nomeCompleto": "João Silva",
    "email": "joao@example.com",
    "perfis": [
      {
        "id": "uuid",
        "nome": "Empregado"
      }
    ],
    "grupos": [
      {
        "id": "uuid",
        "nome": "Residência Silva"
      }
    ]
  }
}
```

**Response 401 (Unauthorized):**
```json
{
  "message": "Credenciais inválidas"
}
```

**Response 429 (Too Many Requests):**
```json
{
  "error": "Muitas tentativas de login. Por favor, aguarde 15 minutos.",
  "retryAfter": 900
}
```

---

#### GET /api/csrf

Obtém um token CSRF para proteção contra ataques CSRF.

**Response 200:**
```json
{
  "csrfToken": "a1b2c3d4e5f6..."
}
```

**Uso:**
Inclua o token no header `x-csrf-token` em todas as requisições POST, PUT, DELETE.

---

### Registro de Ponto

#### POST /api/time-clock/register

Registra um ponto (entrada, saída, pausa).

**Autenticação:** Requerida  
**Rate Limit:** 100 requisições por 15 minutos

**Request Body:**
```json
{
  "usuarioId": "uuid",
  "localId": "uuid",
  "tipo": "ENTRADA",
  "latitude": -23.550520,
  "longitude": -46.633308,
  "observacao": "Registro normal"
}
```

**Tipos válidos:** `ENTRADA`, `SAIDA`, `PAUSA`, `RETORNO_PAUSA`

**Response 200 (Success):**
```json
{
  "success": true,
  "registro": {
    "id": "uuid",
    "tipo": "ENTRADA",
    "dataHora": "2025-10-30T08:00:00.000Z",
    "latitude": -23.550520,
    "longitude": -46.633308
  },
  "geofencingValidado": true,
  "distancia": 45
}
```

**Response 400 (Geofencing Failed):**
```json
{
  "error": "Você está fora da área permitida para registro de ponto",
  "distance": 250,
  "allowedRadius": 100
}
```

---

#### GET /api/time-clock/history

Lista o histórico de registros de ponto de um usuário.

**Autenticação:** Requerida

**Query Parameters:**
- `usuarioId` (required): ID do usuário
- `startDate` (optional): Data inicial (ISO 8601)
- `endDate` (optional): Data final (ISO 8601)
- `page` (optional): Número da página (padrão: 1)
- `pageSize` (optional): Itens por página (padrão: 20, máx: 100)

**Response 200:**
```json
{
  "registros": [
    {
      "id": "uuid",
      "tipo": "ENTRADA",
      "dataHora": "2025-10-30T08:00:00.000Z",
      "latitude": -23.550520,
      "longitude": -46.633308,
      "localTrabalho": {
        "id": "uuid",
        "nome": "Residência Principal"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

### Documentos

#### POST /api/documents/upload

Faz upload de um documento.

**Autenticação:** Requerida  
**Rate Limit:** 10 requisições por hora  
**Tamanho Máximo:** 10MB

**Request Body (multipart/form-data):**
- `usuarioId`: ID do usuário
- `nome`: Nome do arquivo
- `tipo`: Tipo do documento (`RG`, `CPF`, `CTPS`, `CONTRATO`, etc.)
- `file`: Arquivo binário

**Response 201 (Success):**
```json
{
  "success": true,
  "documento": {
    "id": "uuid",
    "nome": "Contrato de Trabalho.pdf",
    "tipo": "CONTRATO",
    "tamanho": 1024000,
    "caminhoArquivo": "/uploads/uuid.pdf",
    "criadoEm": "2025-10-30T10:00:00.000Z"
  }
}
```

**Response 400 (File Too Large):**
```json
{
  "error": "Arquivo muito grande",
  "maxSize": 10485760,
  "receivedSize": 15728640
}
```

---

#### GET /api/documents

Lista documentos de um usuário.

**Autenticação:** Requerida

**Query Parameters:**
- `usuarioId` (required): ID do usuário
- `tipo` (optional): Filtrar por tipo de documento
- `page` (optional): Número da página
- `pageSize` (optional): Itens por página

**Response 200:**
```json
{
  "documentos": [
    {
      "id": "uuid",
      "nome": "RG.jpg",
      "tipo": "RG",
      "tamanho": 512000,
      "criadoEm": "2025-10-15T14:30:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

---

#### DELETE /api/documents/:id

Deleta um documento.

**Autenticação:** Requerida  
**Autorização:** Apenas o dono do documento ou admin

**Response 200:**
```json
{
  "success": true,
  "message": "Documento deletado com sucesso"
}
```

**Response 404:**
```json
{
  "error": "Documento não encontrado"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos ou ausentes |
| 401 | Unauthorized - Token ausente ou inválido |
| 403 | Forbidden - Permissão insuficiente |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

---

## Rate Limiting

Diferentes endpoints têm diferentes limites de taxa:

| Endpoint | Limite |
|----------|--------|
| `/api/auth/login` | 5 req / 15 min |
| `/api/documents/upload` | 10 req / 1 hora |
| APIs gerais | 100 req / 15 min |

Quando o limite é excedido, a resposta inclui:
- Status: 429
- Header `Retry-After`: Segundos até poder tentar novamente
- Header `X-RateLimit-Limit`: Limite total
- Header `X-RateLimit-Remaining`: Requisições restantes
- Header `X-RateLimit-Reset`: Timestamp de reset

---

## Segurança

### HTTPS
Todas as requisições em produção devem usar HTTPS.

### CSRF Protection
Requisições que modificam dados (POST, PUT, DELETE) requerem um token CSRF no header `x-csrf-token`.

### Headers de Segurança
Todas as respostas incluem headers de segurança:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## Webhooks (Futuro)

Planejado para notificações de eventos importantes:
- Novo registro de ponto
- Documento aprovado/rejeitado
- Evento eSocial processado

---

## Suporte

Para questões sobre a API, entre em contato:
- Email: api@sistemadom.com
- Documentação: https://docs.sistemadom.com
