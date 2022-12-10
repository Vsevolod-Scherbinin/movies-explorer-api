const router = require('express').Router();
const auth = require('../middlewares/auth');
const { movieValidation, movieIdValidation } = require('../middlewares/requestsValidation');

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

router.use(auth);
router.get('/movies', getMovies);
router.post('/movies', movieValidation, createMovie);
router.delete('/movies/:movieId', movieIdValidation, deleteMovie);

module.exports = router;
