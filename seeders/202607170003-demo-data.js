'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('books', [
      {
        title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '9780307474728',
        category: 'Novela', publisher: 'Sudamericana', year: 1967, total_copies: 5,
        available_copies: 5, status: 1, description: 'Novela representativa de la literatura latinoamericana.',
        created_at: now, updated_at: now,
      },
      {
        title: 'El principito', author: 'Antoine de Saint-Exupéry', isbn: '9780156012195',
        category: 'Infantil', publisher: 'Reynal & Hitchcock', year: 1943, total_copies: 3,
        available_copies: 3, status: 1, description: 'Historia sobre amistad, imaginación y aprendizaje.',
        created_at: now, updated_at: now,
      },
      {
        title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884',
        category: 'Programación', publisher: 'Prentice Hall', year: 2008, total_copies: 2,
        available_copies: 2, status: 1, description: 'Buenas prácticas de desarrollo de software.',
        created_at: now, updated_at: now,
      },
    ]);

    const userId = await queryInterface.rawSelect(
      'users',
      { where: { email: 'admin@biblioteca.com' } },
      'id',
    );
    const bookId = await queryInterface.rawSelect(
      'books',
      { where: { isbn: '9780132350884' } },
      'id',
    );

    if (userId && bookId) {
      await queryInterface.bulkInsert('loans', [{
        book_id: bookId,
        user_id: userId,
        loan_date: '2026-07-08',
        due_date: '2026-07-15',
        return_date: null,
        status: 1,
        created_at: now,
        updated_at: now,
      }]);
      await queryInterface.bulkUpdate(
        'books',
        { available_copies: 1, status: 1, updated_at: now },
        { id: bookId },
      );
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('loans', { loan_date: '2026-07-08' });
    await queryInterface.bulkDelete('books', {
      isbn: ['9780307474728', '9780156012195', '9780132350884'],
    });
  },
};
