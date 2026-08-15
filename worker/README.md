# Anime Legacy Worker

Cloudflare Worker que consulta la API de Discord para obtener información del servidor en tiempo real.

## Setup

### 1. Crear Bot de Discord

1. Ve a https://discord.com/developers/applications
2. Click en "New Application" → nombre: "Anime Legacy Landing Bot"
3. Ve a "Bot" → "Reset Token" → **copia y guarda el token**
4. En "Bot" → activa "Server Members Intent"
5. Ve a "OAuth2" → "URL Generator":
   - Scopes: `bot`
   - Bot Permissions: `View Channels`
6. Copia la URL generada e invita el bot a tu servidor

### 2. Instalar Wrangler CLI

```bash
npm install -g wrangler
```

### 3. Login en Cloudflare

```bash
cd worker
wrangler login
```

### 4. Crear KV Namespace

```bash
wrangler kv:namespace create "CACHE"
```

Esto te dará un ID. Actualiza `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "EL_ID_QUE_TE_DIO"
```

### 5. Configurar Secrets

```bash
wrangler secret put DISCORD_TOKEN
# Pega el token del bot cuando te lo pida
```

### 6. Deploy

```bash
wrangler deploy
```

Te dará una URL como: `https://anime-legacy-api.tu-subdomain.workers.dev`

### 7. Actualizar Landing Page

En `js/main.js`, cambia la URL del worker:

```javascript
const WORKER_URL = 'https://anime-legacy-api.tu-subdomain.workers.dev';
```

## API

### GET /api/server-info

Devuelve información del servidor de Discord.

**Respuesta:**
```json
{
  "name": "⛄・Anime Legacy 『ESP』",
  "memberCount": 2888,
  "onlineCount": 105,
  "iconUrl": "https://cdn.discordapp.com/icons/...",
  "bannerUrl": "https://cdn.discordapp.com/banners/..."
}
```

**Cache:** 5 minutos (configurable en `wrangler.toml` con `CACHE_TTL`)

## Desarrollo Local

```bash
wrangler dev
```

Crea un archivo `.dev.vars` con:
```
DISCORD_TOKEN=tu_token_aqui
```
