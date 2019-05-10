const jsonschema = require('jsonschema');
const companySchema = require('../schemas/companySchema.json');
const companyUpdateSchema = require('../schemas/companyUpdateSchema.json');
const jobSchema = require('../schemas/jobSchema.json');
const jobUpdateSchema = require('../schemas/jobUpdateSchema.json');
const userSchema = require('../schemas/userSchema.json');
const userUpdateSchema = require('../schemas/userUpdateSchema.json');
const applicationSchema = require('../schemas/applicationSchema.json');
const technologySchema = require('../schemas/technologySchema.json');
const ExpressError = require('../helpers/expressError');

function validateCompanyPost(req, res, next) {
  const result = jsonschema.validate(req.body, companySchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}


function validateCompanyPatch(req, res, next) {
  const result = jsonschema.validate(req.body, companyUpdateSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}

function validateJobPost(req, res, next) {
  const result = jsonschema.validate(req.body, jobSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}

function validateJobPatch(req, res, next) {
  const result = jsonschema.validate(req.body, jobUpdateSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}

function validateUserPost(req, res, next){
  const result = jsonschema.validate(req.body, userSchema);

  if(!result.valid){
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}

function validateUserPatch(req, res, next) {
  const result = jsonschema.validate(req.body, userUpdateSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}

function validateAppState(req, res, next) {
  const result = jsonschema.validate(req.body, applicationSchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}

function validateTechnology(req, res, next) {
  const result = jsonschema.validate(req.body, technologySchema);

  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }

  return next();
}


module.exports = {
  validateCompanyPost,
  validateCompanyPatch,
  validateJobPost,
  validateJobPatch, 
  validateUserPost, 
  validateUserPatch,
  validateAppState,
  validateTechnology
};