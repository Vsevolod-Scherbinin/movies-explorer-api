const router = require('express').Router();
const routesUsers = require('./users');
const routesMovies = require('./movies');

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

module.exports = router;
