/**
 * Creates users table.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').notNullable().unique().index();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('users');
};
