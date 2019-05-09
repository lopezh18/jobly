const express = require('express');
const router = new express.Router();
const Company = require('../models/company');
const { authenticateJWT, ensureLoggedIn, ensureAdmin } = require('../middleware/validation');
const partialUpdate = require('../helpers/partialUpdate');
const { validateCompanyPost, validateCompanyPatch } = require('../middleware/middleware');


router.get('/', authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  try {
    const { search, minEmployees, maxEmployees } = req.query;
    const response = await Company.searchCompanies(search, minEmployees, maxEmployees);
    return res.json({ companies: response });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateCompanyPost, authenticateJWT, ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const newCompany = await Company.newCompany(req.body);
    return res.status(201).json({ company: newCompany });
  } catch (err) {
    next(err);
  }
});

router.get('/:handle', authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  try {
    const { handle } = req.params;
    const foundCompany = await Company.getCompany(handle);
    return res.json({ company: foundCompany.company, jobs: foundCompany.jobs });
  } catch (err) {
    next(err);
  }
});

router.patch('/:handle', validateCompanyPatch, authenticateJWT, ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const { handle } = req.params;
    const updateData = partialUpdate('companies', req.body, 'handle', handle);
    const updatedCompany = await Company.patchCompanyInfo(updateData);
    return res.json({ company: updatedCompany });
  } catch (err) {
    next(err);
  }
});

router.delete('/:handle', authenticateJWT, ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    let { handle } = req.params;
    let deletedCompany = await Company.deleteCompany(handle);
    return res.json({ message: `${deletedCompany.handle} was deleted` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;