/**
 * PUBLIC_INTERFACE
 * runMigrations, rollbackAll, runSeeds
 * Helper functions to programmatically run knex tasks if needed.
 */
const { getDb } = require('./connection');

/**
 * PUBLIC_INTERFACE
 * runMigrations()
 * Runs latest migrations.
 */
async function runMigrations() {
  /** This is a public function to migrate DB schema to latest version. */
  const db = getDb();
  await db.migrate.latest();
}

/**
 * PUBLIC_INTERFACE
 * rollbackAll()
 * Rolls back all migrations.
 */
async function rollbackAll() {
  /** This is a public function to rollback all DB migrations. */
  const db = getDb();
  let result = await db.migrate.currentVersion();
  // Rollback until no migrations left
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const [batch, files] = await db.migrate.rollback(undefined, true);
    if (batch === 0 || files.length === 0) break;
    // loop until everything rolled back
    // eslint-disable-next-line no-await-in-loop
    result = await db.migrate.currentVersion();
    if (result === 'none') break;
  }
}

/**
 * PUBLIC_INTERFACE
 * runSeeds()
 * Runs seed files.
 */
async function runSeeds() {
  /** This is a public function to populate DB with seed data. */
  const db = getDb();
  await db.seed.run();
}

module.exports = {
  // PUBLIC_INTERFACE
  runMigrations,
  // PUBLIC_INTERFACE
  rollbackAll,
  // PUBLIC_INTERFACE
  runSeeds,
};
