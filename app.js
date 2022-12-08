require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const centralErrorHandler = require('./middlewares/centralErrorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const routes = require('./routes');
const rateLimiter = require('./middlewares/rateLimiter');

const { PORT = 4000, NODE_ENV, MONGO_URL } = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : 'mongodb://localhost:27017/moviesdb');

const app = express();

app.use(helmet());
app.use(rateLimiter);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(cors);

app.use(routes);

app.use(errorLogger);
app.use(errors());
app.use(centralErrorHandler);

app.listen(PORT);
