const router = require('express').Router();
const routesUsers = require('./users');
const routesMovies = require('./movies');
const NotFoundError = require('../errors/NotFoundError');

const { signInValidation, signUpValidation } = require('../middlewares/requestsValidation'); // adapt
const auth = require('../middlewares/auth');
const {
  createUser, login, clearCookie,
} = require('../controllers/users');

router.post('/signup', signUpValidation, createUser);
router.post('/signin', signInValidation, login);

router.use(auth);
router.get('/signout', clearCookie);
router.use(routesUsers);
router.use(routesMovies);

router.use((req, res, next) => next(new NotFoundError('Некорректный адрес запроса')));

module.exports = router;
