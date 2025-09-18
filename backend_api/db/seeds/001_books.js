/**
 * Seeds default books.
 */
exports.seed = async function seed(knex) {
  await knex('order_items').del();
  await knex('orders').del();
  await knex('books').del();
  await knex('users').del();

  await knex('books').insert([
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      description:
        'A Handbook of Agile Software Craftsmanship with best practices for writing clean, maintainable code.',
      price: 29.99,
      stock: 50,
      cover_image:
        'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX374_BO1,204,203,200_.jpg',
    },
    {
      id: 2,
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      description:
        'Journey to Mastery with timeless practical advice for software developers.',
      price: 34.99,
      stock: 40,
      cover_image:
        'https://images-na.ssl-images-amazon.com/images/I/518FqJvR9aL._SX377_BO1,204,203,200_.jpg',
    },
    {
      id: 3,
      title: 'Design Patterns',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      description:
        'Elements of Reusable Object-Oriented Software covering classic design patterns.',
      price: 39.99,
      stock: 30,
      cover_image:
        'https://images-na.ssl-images-amazon.com/images/I/41gtGZ2bS-L._SX396_BO1,204,203,200_.jpg',
    },
    {
      id: 4,
      title: 'You Don’t Know JS Yet: Scope & Closures',
      author: 'Kyle Simpson',
      description:
        'Deep dive into JavaScript fundamentals focusing on scope and closures.',
      price: 19.99,
      stock: 100,
      cover_image:
        'https://images-na.ssl-images-amazon.com/images/I/41kTnJz4vWL._SX331_BO1,204,203,200_.jpg',
    },
  ]);
};
