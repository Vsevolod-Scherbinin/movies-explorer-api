require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { signInValidation, signUpValidation } = require('./middlewares/requestsValidation'); // adapt
const { clearCookie } = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');
const centralErrorHandler = require('./middlewares/centralErrorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

mongoose.connect('mongodb://localhost:27017/diplomadb');

const routesUsers = require('./routes/users');
const routesMovies = require('./routes/movies');
const {
  createUser, login,
} = require('./controllers/users');

const { PORT = 4000 } = process.env;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use(cors);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', signUpValidation, createUser);
app.post('/signin', signInValidation, login);
app.get('/signout', clearCookie);

app.use(routesUsers);
app.use(routesMovies);

app.use((req, res, next) => next(new NotFoundError('Некорректный адрес запроса')));

app.use(errorLogger);
app.use(errors());
app.use(centralErrorHandler);

app.listen(PORT);
