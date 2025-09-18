/**
 * Creates books table.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('books', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable().index();
    table.string('author').notNullable().index();
    table.text('description').notNullable();
    table.decimal('price', 10, 2).notNullable().index();
    table.integer('stock').notNullable().defaultTo(0);
    table.string('cover_image').nullable();
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('books');
};
