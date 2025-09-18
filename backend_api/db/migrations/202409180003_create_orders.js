/**
 * Creates orders table.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      .notNullable()
      .index();
    table.decimal('total_amount', 10, 2).notNullable().defaultTo(0);
    table.string('status').notNullable().defaultTo('pending'); // pending, paid, shipped, completed, cancelled
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('orders');
};
