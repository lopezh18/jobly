const express = require('express');
const router = new express.Router();
const ExpressError = require('../helpers/expressError');
const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require('jsonwebtoken');
const { SECRET, OPTIONS } = require('../config');

router.post('/', async function(req, res, next){
  try{
    const { username, password } = req.body;
    const results = await db.query(`
      SELECT password, is_admin FROM users
      WHERE username = $1
    `, [username]);

    const user = results.rows[0];
    
    if(user){
      if(await bcrypt.compare(password, user.password)){
        let token = jwt.sign({ username: username, is_admin: user.is_admin}, SECRET, OPTIONS);
        return res.json({ token });
      }
    }  
    throw new ExpressError('Invalid username & password', 400);

  }catch(e){
    return next(e);
  }
});

module.exports = router;