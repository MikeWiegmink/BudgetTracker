# BudgetTracker

A small budget tracking application with an Express/SQLite backend and a Next.js frontend. It lets you keep track of transactions and categories, and provides simple aggregation endpoints (monthly totals, averages, most common category).

## Project structure

- `backend/` - Express API server (`src/`) and its test suite (`tests/`)
- `frontend/` - Next.js frontend
- `docker-compose.yml` - runs backend and frontend together

## Running with Docker

Requires Docker with the Compose plugin. From the project root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

The SQLite database is stored in the `db-data` volume, so data survives restarts. `docker compose down -v` also deletes the database.

Code is copied into the images at build time, so rebuild after changing code (`docker compose up -d --build`). For day-to-day development, running both services locally (see below) gives you hot reload.

The frontend fetches data from the browser via `http://localhost:8080`, and server-side via the `INTERNAL_API_URL` environment variable (set to `http://backend:8080` in `docker-compose.yml`).

## Backend

### Requirements

- Node.js 22+

### Setup

```bash
cd backend
npm install
npm start
```

The server listens on `http://localhost:8080` by default.

The SQLite database file location can be configured with the `DB_PATH` environment variable; if unset it defaults to `app.db` in the working directory.

### Running tests

```bash
cd backend
npm test
```

### API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/categories` | List categories |
| GET | `/categories/:id` | Get a category |
| POST | `/categories` | Create a category |
| PUT | `/categories/:id` | Update a category |
| DELETE | `/categories/:id` | Delete a category |
| GET | `/transactions` | List transactions (filter by `date`, `category_id`) |
| GET | `/transactions/:id` | Get a transaction |
| POST | `/transactions` | Create a transaction |
| PUT | `/transactions/:id` | Update a transaction |
| DELETE | `/transactions/:id` | Delete a transaction |
| GET | `/summary` | Total, average and max amount for a given `date` (`YYYY-MM` or `YYYY-MM-DD`) and/or `category_id` |
| GET | `/commoncategory` | Category counts for a given month, sorted descending |

## Frontend

### Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and expects the backend API to be available on `http://localhost:8080`.

### Running tests

```bash
cd frontend
npm test
```

## License

This project is licensed under the [MIT License](LICENSE).
