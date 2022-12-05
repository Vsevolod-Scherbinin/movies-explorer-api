const mongoose = require('mongoose');
const Movie = require('../models/movie');
const {
  NotFound, CastError,
} = require('../constants/constants');
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
  Movie.findById(req.params.movieId).orFail(() => new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Функция недоступна');
      }
      return Movie.findByIdAndRemove(req.params.movieId).orFail(new Error(NotFound))
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
