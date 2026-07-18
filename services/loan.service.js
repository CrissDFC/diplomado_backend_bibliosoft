const { Op } = require('sequelize');
const { sequelize, Loan, Book, User } = require('../models');
const AppError = require('../utils/AppError');
const { requirePositiveInteger, requireDate } = require('../utils/validators');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loanDto(loan) {
  return {
    id: loan.id,
    bookId: loan.bookId,
    userId: loan.userId,
    loanDate: loan.loanDate,
    dueDate: loan.dueDate,
    returnDate: loan.returnDate ?? null,
    status: loan.status,
    bookTitle: loan.Book?.title,
    userName: loan.User?.name,
  };
}

const include = [
  { model: Book, attributes: ['id', 'title', 'totalCopies', 'availableCopies', 'status'] },
  { model: User, attributes: ['id', 'name', 'email', 'status'] },
];

async function getAll(requester, filters = {}) {
  const where = {};
  if (requester.role === 'reader') where.userId = requester.id;
  if (filters.status !== undefined && filters.status !== '') {
    const status = Number(filters.status);
    if (![0, 1, 2, 3].includes(status)) throw new AppError(400, 'El estado del préstamo no es válido');
    where.status = status;
  }
  if (filters.search?.trim()) {
    const search = `%${filters.search.trim()}%`;
    where[Op.or] = [
      { '$Book.title$': { [Op.iLike]: search } },
      { '$User.name$': { [Op.iLike]: search } },
    ];
  }
  const loans = await Loan.findAll({ where, include, order: [['loanDate', 'DESC']] });
  return loans.map(loanDto);
}

async function getById(id, requester) {
  const loan = await Loan.findByPk(id, { include });
  if (!loan) throw new AppError(404, 'Préstamo no encontrado');
  if (requester.role === 'reader' && loan.userId !== requester.id) {
    throw new AppError(403, 'Solo puede consultar sus propios préstamos');
  }
  return loanDto(loan);
}

async function create(data) {
  const bookId = requirePositiveInteger(data.bookId, 'bookId');
  const userId = requirePositiveInteger(data.userId, 'userId');
  const dueDate = requireDate(data.dueDate, 'dueDate');
  const loanDate = today();
  if (dueDate < loanDate) throw new AppError(400, 'La fecha límite no puede ser anterior al préstamo');

  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new AppError(404, 'Usuario no encontrado');
    if (user.status !== 1) throw new AppError(409, 'El usuario está inactivo');

    const book = await Book.findByPk(bookId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!book) throw new AppError(404, 'Libro no encontrado');
    if (book.status === 0 || book.availableCopies < 1) {
      throw new AppError(409, 'El libro no tiene ejemplares disponibles');
    }

    const loan = await Loan.create({
      bookId,
      userId,
      loanDate,
      dueDate,
      returnDate: null,
      status: 1,
    }, { transaction });
    const availableCopies = book.availableCopies - 1;
    await book.update({
      availableCopies,
      status: availableCopies > 0 ? 1 : 2,
    }, { transaction });

    await transaction.commit();
    loan.Book = book;
    loan.User = user;
    return loanDto(loan);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function update(id, data) {
  const loan = await Loan.findByPk(id, { include });
  if (!loan) throw new AppError(404, 'Préstamo no encontrado');
  if (loan.status !== 1) throw new AppError(409, 'Solo puede editar préstamos activos');
  const dueDate = requireDate(data.dueDate, 'dueDate');
  if (dueDate < loan.loanDate) throw new AppError(400, 'La fecha límite no puede ser anterior al préstamo');
  await loan.update({ dueDate });
  return loanDto(loan);
}

async function close(id, status) {
  const transaction = await sequelize.transaction();
  try {
    const loan = await Loan.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!loan) throw new AppError(404, 'Préstamo no encontrado');
    if (loan.status !== 1) throw new AppError(409, 'El préstamo ya fue devuelto o cancelado');

    const book = await Book.findByPk(loan.bookId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!book) throw new AppError(404, 'Libro asociado no encontrado');

    const changes = { status };
    if (status === 2) changes.returnDate = today();
    await loan.update(changes, { transaction });

    const availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    await book.update({
      availableCopies,
      status: book.status === 0 ? 0 : 1,
    }, { transaction });

    await transaction.commit();
    loan.Book = book;
    return loanDto(loan);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

const returnLoan = (id) => close(id, 2);
const cancel = (id) => close(id, 0);

module.exports = { getAll, getById, create, update, returnLoan, cancel };
