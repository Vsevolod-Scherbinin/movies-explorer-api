const mongoose = require('mongoose');
const Movie = require('../models/movie');
const { CastError } = require('../constants/constants');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Некорректные данные'));
      }

      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findOne({ movieId: req.params.movieId }).orFail(() => new NotFoundError('Запрашиваемый ролик не найден'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Функция недоступна');
      }
      return Movie.findOneAndRemove({ movieId: req.params.movieId }).orFail(new NotFoundError('Запрашиваемый ролик не найден'))
        .then(() => {
          res.send({ data: movie });
        });
    })
    .catch((err) => {
      if (err.name === CastError) {
        return next(new BadRequestError('Некорректные данные'));
      }

      return next(err);
    });
};
