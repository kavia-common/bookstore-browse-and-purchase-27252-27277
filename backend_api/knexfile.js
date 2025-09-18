/**
 * Knex configuration file for different environments.
 * Uses SQLite3 with the filename provided via DATABASE_URL from .env.
 */
const path = require('path');
require('dotenv').config();

const defaultDbFile = path.resolve(__dirname, 'data', 'dev.sqlite3');
const dbFile = process.env.DATABASE_URL
  ? path.resolve(__dirname, process.env.DATABASE_URL)
  : defaultDbFile;

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: dbFile,
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, 'db', 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.resolve(__dirname, 'db', 'seeds'),
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, 'data', 'test.sqlite3'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, 'db', 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.resolve(__dirname, 'db', 'seeds'),
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: dbFile,
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, 'db', 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.resolve(__dirname, 'db', 'seeds'),
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
  },
};
