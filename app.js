/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const app = express();
const companyRouter = require('./routes/companies');
const jobRouter = require('./routes/jobs');
const loginRouter = require('./routes/login');
const userRouter = require('./routes/users');

app.use(express.json());

// add logging system
app.use(morgan("tiny"));

app.use('/companies', companyRouter);
app.use('/jobs', jobRouter);
app.use('/users', userRouter);
app.use('/login', loginRouter);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  // eslint-disable-next-line no-console
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
