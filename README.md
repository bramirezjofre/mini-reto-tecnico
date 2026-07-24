# Mini Reto Técnico

Monorepo con dos aplicaciones:

- `apps/api`: backend en **NestJS** con el endpoint `GET /user/:username` que consulta la API pública de GitHub.
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

### `apps/api/.env`

| Variable              | Descripción                                  | Default                     |
| --------------------- | -------------------------------------------- | --------------------------- |
| `PORT`                | Puerto del backend.                          | `3001`                      |
| `GITHUB_API_BASE_URL` | Base URL de la API pública de GitHub.        | `https://api.github.com`    |
| `GITHUB_TOKEN`        | Token opcional para subir el rate limit.     | (vacío)                     |
| `CORS_ORIGIN`         | Orígenes permitidos, separados por coma.     | `http://localhost:3000`     |

### `apps/web/.env`

| Variable                    | Descripción                                              | Default                |
| --------------------------- | -------------------------------------------------------- | ---------------------- |
| `NEXT_PUBLIC_API_URL`       | URL del backend NestJS.                                  | `http://localhost:3001`|
| `NEXT_PUBLIC_GITHUB_USERNAME` | Username de GitHub a mostrar.                           | `bramirezjofre`        |

> Las variables `NEXT_PUBLIC_*` se inlinean al bundle en build time, así que cualquier cambio requiere reconstruir.

## Levantar con Docker

```bash
docker compose up -d --build
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:3001/user/bramirezjofre>

Para bajar los servicios:

```bash
docker compose down
```

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

## Endpoint

```http
GET /user/:username
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

## Arquitectura

```txt
mini-reto-tecnico/
  apps/
    api/                 # NestJS (puerto 3001)
      src/users/         # UsersModule (controller + service + GitHub client)
    web/                 # NextJS (puerto 3000)
      app/               # App Router
  docker-compose.yml
```

- El frontend hace fetch server-side al backend (no expone credenciales).
- `apps/web/next.config.ts` declara `remotePatterns` para `avatars.githubusercontent.com`.
- No hay base de datos ni autenticación; GitHub se consulta en cada request.
