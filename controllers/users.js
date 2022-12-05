const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwtoken = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

const {
  NotFound, CastError,
} = require('../constants/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId || req.user._id).orFail(new Error(NotFound))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === CastError) {
        return next(new BadRequestError('Некорректные данные'));
      }

      if (err.message === NotFound) {
        return next(new NotFoundError('Запрашиваемый пользователь не найден'));
      }

      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.send({
      data: {
        email: user.email,
        name: user.name,
      },
    }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Некорректные данные'));
      }

      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с такими данными уже существует'));
      }

      return next(err);
    });
};

module.exports.editUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(req.user._id, { email, name }, {
    new: true,
    runValidators: true,
  }).orFail(() => new NotFoundError('Запрашиваемый пользователь не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Некорректные данные'));
      }

      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwtoken.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: 'None',
        // secure: true,
      })
        .status(200).send({ message: 'Авторзация прошла успешно' });
    })

    .catch(() => next(new UnauthorizedError('Ошибка авторизации')));
};

module.exports.clearCookie = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    .send({ message: 'Вы вышли из аккаунта' });
};
