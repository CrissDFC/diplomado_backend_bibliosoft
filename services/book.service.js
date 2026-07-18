const { Op } = require('sequelize');
const { Book } = require('../models');
const AppError = require('../utils/AppError');
const {
  requireString,
  optionalString,
  requirePositiveInteger,
} = require('../utils/validators');

function validateBook(data) {
  const isbn = requireString(data.isbn, 'isbn', 20);
  if (!/^[0-9Xx-]{10,20}$/.test(isbn)) throw new AppError(400, 'El ISBN no es válido');
  if (!Number.isInteger(data.year) || data.year < 1000 || data.year > new Date().getFullYear()) {
    throw new AppError(400, 'El año no es válido');
  }

  return {
    title: requireString(data.title, 'title', 180),
    author: requireString(data.author, 'author', 120),
    isbn,
    category: requireString(data.category, 'category', 80),
    publisher: optionalString(data.publisher, 'publisher', 120),
    year: data.year,
    totalCopies: requirePositiveInteger(data.totalCopies, 'totalCopies'),
    description: optionalString(data.description, 'description', 2000),
  };
}

async function getAll(filters = {}) {
  const where = {};
  if (filters.status !== undefined && filters.status !== '') {
    const status = Number(filters.status);
    if (![0, 1, 2].includes(status)) throw new AppError(400, 'El estado del libro no es válido');
    where.status = status;
  }
  if (filters.search?.trim()) {
    const search = `%${filters.search.trim()}%`;
    where[Op.or] = [
      { title: { [Op.iLike]: search } },
      { author: { [Op.iLike]: search } },
      { isbn: { [Op.iLike]: search } },
    ];
  }
  return Book.findAll({ where, order: [['title', 'ASC']] });
}

async function getById(id) {
  const book = await Book.findByPk(id);
  if (!book) throw new AppError(404, 'Libro no encontrado');
  return book;
}

async function create(data) {
  const book = validateBook(data);
  return Book.create({ ...book, availableCopies: book.totalCopies, status: 1 });
}

async function update(id, data) {
  const current = await getById(id);
  const book = validateBook(data);
  const borrowedCopies = current.totalCopies - current.availableCopies;
  if (book.totalCopies < borrowedCopies) {
    throw new AppError(409, 'No puede reducir los ejemplares por debajo de los préstamos activos');
  }
  const availableCopies = book.totalCopies - borrowedCopies;
  const status = current.status === 0 ? 0 : (availableCopies > 0 ? 1 : 2);
  return current.update({ ...book, availableCopies, status });
}

async function disable(id) {
  const book = await getById(id);
  return book.update({ status: 0 });
}

module.exports = { getAll, getById, create, update, disable };
