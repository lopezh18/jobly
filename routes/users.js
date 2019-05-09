const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { validateUserPost, validateUserPatch } = require('../middleware/middleware');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser, ensureAdmin } = require('../middleware/validation');
const jwt = require('jsonwebtoken');
const { SECRET, OPTIONS } = require('../config');
const partialUpdate = require('../helpers/partialUpdate');


router.post('/', validateUserPost, async function(req, res, next){
  try{
    req.body.password = await bcrypt.hash(req.body.password, 12);
    const results = await User.createUser(req.body);
    const  token = jwt.sign( {username: results.username, is_admin: results.is_admin} , SECRET, OPTIONS);
    return res.json({ token });
  } catch(e){
    return next(e);
  }
});

router.get('/', async function(req, res, next){
  try{
    const results = await User.getUsers();
    return res.json({ users: results });
  } catch(e){
    return next(e);
  }
});

router.get('/:username', async function(req, res, next){
  try{
    const results = await User.getSingleUser(req.params.username.toLowerCase());
    return res.json({ user: results });
  } catch(e){
    return next(e);
  }
});

router.patch('/:username', validateUserPatch, authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function(req, res, next){
  try{
    const { username } = req.params;
    const updateData = partialUpdate('users', req.body, 'username', username.toLowerCase());
    const results = await User.updateUser(updateData);
    return res.json({ user: results });
  } catch(e){
    return next(e);
  }
});

router.delete('/:username', authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function(req, res, next){
  try{
    const results = await User.deleteUser(req.params.username);
    return res.json({ message: `${results.username} has been deleted` });
  } catch(e){
    return next(e);
  }
});

//admin can change admin status of users
router.patch('/admin/:username', authenticateJWT, ensureLoggedIn, ensureAdmin, async function(req, res, next){
  try{
    await User.updateAdminStatus(req.params.username);
    return res.json({ message: `${req.params.username}'s is_admin status has been updated` });
  } catch(e){
    return next(e);
  }
});

module.exports = router;