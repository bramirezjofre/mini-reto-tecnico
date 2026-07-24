# Mini Reto Técnico

Monorepo con dos aplicaciones:

- `apps/api`: backend en **NestJS 11** con el endpoint `GET /user/:username` que consulta la API pública de GitHub.
- `apps/web`: frontend en **NextJS 16** que consume ese endpoint y renderiza el perfil.

## Requisitos

- Node.js 20.9+ y npm.
- Docker + Docker Compose (opcional).

## Variables de entorno

Cada app tiene su propio `.env.example`. Copialos a `.env` y ajustá los valores:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Los archivos `.env` están ignorados por git. Solo los `.env.example` se versionan.

### `apps/api/.env`

| Variable              | Descripción                                                                 | Default                                                |
| --------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| `PORT`                | Puerto HTTP del backend.                                                    | `3001`                                                 |
| `GITHUB_API_BASE_URL` | Base URL de la API pública de GitHub.                                       | `https://api.github.com`                               |
| `GITHUB_TOKEN`        | Token PAT opcional para subir el rate limit (60/h → 5000/h).                | (vacío)                                                |
| `GITHUB_TIMEOUT_MS`   | Timeout al llamar a GitHub, en milisegundos.                                | `5000`                                                 |
| `CORS_ORIGIN`         | Orígenes CORS separados por coma. `*` para permitir cualquiera.             | `http://localhost:3000,http://web:3000`                |

### `apps/web/.env`

| Variable                    | Descripción                                                                     | Default                |
| --------------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| `API_URL`                   | URL server-only del backend NestJS. **No** se expone al navegador.              | `http://localhost:3001`|
| `NEXT_PUBLIC_GITHUB_USERNAME` | Username de GitHub a mostrar. Se inlinea en el bundle en build time.           | `bramirezjofre`        |

> `NEXT_PUBLIC_*` se reemplaza en build time, así que cualquier cambio requiere reconstruir. `API_URL` solo se lee en el servidor.

## Levantar con Docker

```bash
docker compose up -d --build
```

- Frontend: <http://localhost:3000>
- Backend:  <http://localhost:3001/user/bramirezjofre>
- Health:   <http://localhost:3001/health>

Para bajar los servicios:

```bash
docker compose down
```

Dentro de Docker, `web` usa `http://api:3001` para hablar con el backend. Ese valor se inyecta como `API_URL` en el bloque `environment` del servicio `web` (no como build arg), por lo que la imagen es reutilizable y no requiere rebuild si cambia.

## Levantar sin Docker

En dos terminales:

```bash
# Terminal 1
cd apps/api
npm install
npm run start:dev
```

```bash
# Terminal 2
cd apps/web
npm install
npm run dev
```

## Endpoints

### `GET /user/:username`

```http
GET /user/bramirezjofre
```

Respuesta:

```json
{
  "username": "bramirezjofre",
  "name": null,
  "bio": null,
  "avatarUrl": "https://avatars.githubusercontent.com/u/141526057?v=4",
  "profileUrl": "https://github.com/bramirezjofre",
  "publicRepos": 2,
  "followers": 2,
  "following": 0,
  "location": null,
  "company": null,
  "blog": "",
  "twitterUsername": null,
  "createdAt": "2023-08-05T21:12:32Z"
}
```

Errores:

- `400 Bad Request` — username con formato inválido.
- `404 Not Found` — GitHub no conoce ese usuario.
- `502 Bad Gateway` — la API pública de GitHub falló.
- `504 Gateway Timeout` — GitHub no respondió a tiempo.

### `GET /health`

Healthcheck local (no llama a GitHub). Lo usa `docker compose` para supervisar `api`.

```json
{
  "status": "ok",
  "uptimeSeconds": 12,
  "timestamp": "2026-07-24T13:00:00.000Z"
}
```

## Arquitectura

```txt
mini-reto-tecnico/
  apps/
    api/
      src/
        health/                 # GET /health
        users/                  # GET /user/:username + GitHub client + filter + pipe
      test/                     # e2e (jest + supertest)
    web/
      app/                      # App Router
  docker-compose.yml
```

- El frontend hace fetch **server-side** al backend (`API_URL` server-only, no se expone).
- `apps/web/next.config.ts` declara `remotePatterns` para `avatars.githubusercontent.com`.
- El backend usa `AbortSignal.timeout` para no colgarse si GitHub se cuelga.
- No hay base de datos ni autenticación; GitHub se consulta en cada request (cache activable vía `CacheModule` si se necesita más adelante).

## Tests

```bash
# Backend
cd apps/api
npm run test:e2e

# Frontend
cd apps/web
npm run lint
```
