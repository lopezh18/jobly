/* eslint-disable indent */
const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const Technology = require('../models/technology');
const Application = require('../models/application');
const { authenticateJWT, ensureLoggedIn, ensureAdmin} = require('../middleware/validation');
const { validateJobPost, validateJobPatch, validateAppState, validateTechnology } = require('../middleware/middleware');
const partialUpdate = require('../helpers/partialUpdate');

router.get('/', authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  try {
    const { search, minSalary, minEquity } = req.query;
    const response = await Job.searchJobs(search, minSalary, minEquity);
    return res.json({ jobs: response });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateJobPost, authenticateJWT, ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try{
		const newJob = await Job.createJob(req.body);
		return res.status(201).json({ job: newJob });
	} catch(err) {
		next(err);
	}
});

router.get('/:id', authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;
		const foundJob = await Job.getJob(id);
    return res.json({ job: foundJob.job, technology: foundJob.technology });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validateJobPatch, authenticateJWT, ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const { id } = req.params;
		const updateData = partialUpdate('jobs', req.body, 'id', +id);
    const updatedJob = await Job.patchJobInfo(updateData);
    return res.json({ job: updatedJob });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticateJWT, ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    let { id } = req.params;
    let deletedJob = await Job.deleteJob(id);
    return res.json({ message: `Job ${deletedJob.title} at ID: ${deletedJob.id} was deleted` });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/apply', authenticateJWT, ensureLoggedIn, validateAppState, async function(req, res, next) {
  try{
    let { id } = req.params;
    let appQuery = await Application.jobStatus(req.user.username, id, req.body.state.toLowerCase());
    return res.json({ message: appQuery.state });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/tech', authenticateJWT, ensureLoggedIn, validateTechnology, async function(req, res, next) {
  try{
    let { id } = req.params;
    let appQuery = await Technology.addTechnology(id, req.body.language_name.toLowerCase());
    return res.json({ message: ` ${appQuery.language_name} was added to technology` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;