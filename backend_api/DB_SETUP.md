# Database Setup (SQLite + Knex)

This backend uses SQLite with Knex for the database layer.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed:

- PORT: Server port (e.g., 3001)
- DATABASE_URL: Path to sqlite database file (e.g., ./data/dev.sqlite3)
- JWT_SECRET: Secret used for signing JWTs

## Install dependencies

npm install

## Run migrations

npm run migrate

## Seed initial data

npm run seed

Seeds include a set of starter books.

## Reset the database (dangerous - deletes DB file)

npm run db:reset
