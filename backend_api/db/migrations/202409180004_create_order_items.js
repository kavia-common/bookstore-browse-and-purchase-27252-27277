/**
 * Creates order_items table.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table
      .integer('order_id')
      .unsigned()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      .notNullable()
      .index();
    table
      .integer('book_id')
      .unsigned()
      .references('id')
      .inTable('books')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
      .notNullable()
      .index();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('line_total', 10, 2).notNullable();
    table.timestamps(true, true);

    table.unique(['order_id', 'book_id']);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('order_items');
};
