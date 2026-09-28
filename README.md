# BudgetTracker

A small budget tracking application with an Express/SQLite backend and a Next.js frontend. It lets you keep track of transactions and categories, and provides simple aggregation endpoints (monthly totals, averages, most common category).

## Project structure

- `src/` – Express API server (backend)
- `tests/` – backend test suite
- `frontend/` – Next.js frontend

## Backend

### Requirements

- Node.js 22+

### Setup

```bash
npm install
npm start
```

The server listens on `http://localhost:8080` by default.

The SQLite database file location can be configured with the `DB_PATH` environment variable; if unset it defaults to `app.db` in the project root.

### Running tests

```bash
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
