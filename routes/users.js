const router = require('express').Router();
const auth = require('../middlewares/auth');
const { userDataValidation } = require('../middlewares/requestsValidation');

const {
  getUserById, editUser,
} = require('../controllers/users');

router.use(auth);
router.get('/users/me', getUserById);
router.patch('/users/me', userDataValidation, editUser);
// router.get('/users/:userId', userIdValidation, getUserById);

module.exports = router;
