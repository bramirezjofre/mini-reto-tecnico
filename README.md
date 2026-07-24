# Mini Reto Técnico

Monorepo con dos aplicaciones:

- `apps/api`: backend en **NestJS** con el endpoint `GET /user/:username` que consulta la API pública de GitHub.
- `apps/web`: frontend en **NextJS** que consume ese endpoint al cargar y renderiza el perfil.

## Requisitos

- Node.js 20.9+ y npm.
- Docker + Docker Compose (opcional).

## Levantar con Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001/user/bramirezjofre

## Levantar sin Docker

Backend:

```bash
cd apps/api
npm install
npm run start:dev
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

## Endpoint

```http
GET /user/:username
```

Respuesta de ejemplo:

```json
{
  "username": "bramirezjofre",
  "name": "...",
  "bio": "...",
  "avatarUrl": "https://...",
  "profileUrl": "https://github.com/bramirezjofre",
  "publicRepos": 0,
  "followers": 0,
  "following": 0,
  "location": null,
  "company": null,
  "blog": null,
  "createdAt": "..."
}
```

## Arquitectura

```txt
mini-reto-tecnico/
  apps/
    api/      # NestJS (puerto 3001)
    web/      # NextJS (puerto 3000)
  docker-compose.yml
```

- El frontend consume el backend a través de `API_URL` (en local: `http://localhost:3001`, en Docker: `http://api:3001`).
- No hay base de datos ni autenticación; la API pública de GitHub se consulta en cada request.
