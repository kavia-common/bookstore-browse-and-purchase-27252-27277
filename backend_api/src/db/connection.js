/**
 * PUBLIC_INTERFACE
 * getDb
 * This module initializes and exports a Knex instance based on the current NODE_ENV.
 * It reads configuration from knexfile.js and ensures a single shared instance.
 */
const knex = require('knex');
const path = require('path');
const knexConfig = require('../../knexfile');

let dbInstance;

/**
 * PUBLIC_INTERFACE
 * getDb()
 * Returns a singleton Knex instance.
 */
function getDb() {
  /** This is a public function that returns the initialized database connection. */
  if (!dbInstance) {
    const env = process.env.NODE_ENV || 'development';
    const config = knexConfig[env];

    // Ensure DB directory exists for SQLite
    if (
      config &&
      config.connection &&
      typeof config.connection.filename === 'string'
    ) {
      const dir = path.dirname(config.connection.filename);
      // eslint-disable-next-line global-require
      const fs = require('fs');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    dbInstance = knex(config);
  }
  return dbInstance;
}

module.exports = {
  // PUBLIC_INTERFACE
  getDb,
};
