# Nest Todo Server

Production-structured NestJS + MongoDB (Mongoose) + JWT Todo API, TypeScript.

## Folder structure

```
src/
├── main.ts                     # bootstrap: helmet, compression, CORS, global pipes/filters
├── app.module.ts                # root module — wires Mongo, config, throttling, feature modules
├── config/
│   └── configuration.ts         # typed env loader
├── common/
│   ├── decorators/current-user.decorator.ts
│   ├── filters/http-exception.filter.ts    # global error -> consistent JSON shape
│   ├── interceptors/transform.interceptor.ts # global success -> consistent JSON shape
│   └── guards/jwt-auth.guard.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts       # POST /auth/register, POST /auth/login
│   ├── auth.service.ts
│   ├── strategies/jwt.strategy.ts
│   └── dto/{register,login}.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts      # GET /users/me
│   ├── users.service.ts
│   └── schemas/user.schema.ts
└── todos/
    ├── todos.module.ts
    ├── todos.controller.ts      # POST/GET/PATCH/DELETE /todos
    ├── todos.service.ts
    ├── schemas/todo.schema.ts
    └── dto/{create-todo,update-todo}.dto.ts
```

Each feature is a self-contained **module** (controller + service + schema),
similar to how you'd group `routes/`, `controllers/`, and `models/` per
resource in Express — Nest just enforces the boundary with `@Module()`.

## Setup

```bash
cp .env.example .env
npm install
```

Edit `.env` — at minimum set `JWT_SECRET` to a long random string and
`MONGODB_URI` to your database.

### Run MongoDB locally and inspect it with mongosh

```bash
# start mongod (if not already running as a service)
mongod --dbpath /path/to/data

# in another terminal, connect with the shell to verify / inspect data
mongosh "mongodb://127.0.0.1:27017/todo_db"

# inside mongosh, once the app has created some data:
show collections
db.users.find().pretty()
db.todos.find({ user: ObjectId("...") }).pretty()
```

### Run the API

```bash
npm run start:dev   # watch mode
npm run build && npm run start:prod   # production
```

Server listens on `http://localhost:3000/api/v1` by default (prefix from `API_PREFIX`).

## API Reference

All responses are wrapped as `{ success, statusCode, data }` on success or
`{ success: false, statusCode, error, message, path, timestamp }` on error.

### Auth

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | creates user, returns `{ accessToken, user }` |
| POST | `/auth/login` | `{ email, password }` | returns `{ accessToken, user }` |

### Users (requires `Authorization: Bearer <token>`)

| Method | Route | Notes |
|---|---|---|
| GET | `/users/me` | current user's profile |

### Todos (requires `Authorization: Bearer <token>`, always scoped to the caller)

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/todos` | `{ title, description?, completed? }` | create |
| GET | `/todos` | — | list current user's todos |
| GET | `/todos/:id` | — | single todo (404/403 if not owned) |
| PATCH | `/todos/:id` | any subset of create fields | update |
| DELETE | `/todos/:id` | — | delete |

## Production notes already baked in

- **Validation**: `class-validator` DTOs + global `ValidationPipe` (whitelist, forbid unknown fields, auto-transform).
- **Security headers**: `helmet()`.
- **Compression**: gzip via `compression()`.
- **Rate limiting**: `@nestjs/throttler`, global guard, configurable via `THROTTLE_TTL`/`THROTTLE_LIMIT`.
- **Consistent responses**: global exception filter + transform interceptor.
- **Password hashing**: bcrypt, `select: false` on the schema field so it's never returned by default.
- **Ownership checks**: every todo mutation verifies `todo.user === req.user.id` before acting.
- **Graceful shutdown**: `app.enableShutdownHooks()`.
- **CORS**: configurable origin list via `CORS_ORIGIN`.

## Suggested next steps for a real deployment

- Add a `docker-compose.yml` (app + mongo) and a multi-stage `Dockerfile`.
- Add refresh tokens / token revocation if you need logout-everywhere semantics.
- Add `class-validator` custom pipes or a `Roles` guard if you introduce admin users.
- Add request logging (e.g. `nestjs-pino`) and a `/health` endpoint (`@nestjs/terminus`) for orchestrators.
