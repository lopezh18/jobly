const ExpressError = require('../helpers/expressError');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');


function authenticateJWT(req, res, next){
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next){
  if (!req.user) {
    const err = new ExpressError("Unauthorized",401);
    return next(err);
  } else {
    return next();
  }
}

function ensureCorrectUser(req, res, next){
  const err = new ExpressError("Unauthorized", 401);
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next(err);
    }
  } catch(err){
    // errors would happen here 
    // if we made a request and req.user is undefined
    return next(err);
  }
}

function ensureAdmin(req, res, next){
  const err = new ExpressError("Unauthorized", 401);
  try {
    if (req.user.is_admin) {
      return next();
    } else {
      return next(err);
    }
  } catch(err){
    // errors would happen here 
    // if we made a request and req.user is undefined
    return next(err);
  }
}

module.exports = { authenticateJWT, ensureLoggedIn, ensureCorrectUser, ensureAdmin };