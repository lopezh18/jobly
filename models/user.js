const db = require('../db');
const ExpressError = require('../helpers/expressError');

class User{

  static async createUser(userObj){
    const userQuery = await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, 
    [userObj.username.toLowerCase(), userObj.password, userObj.first_name, userObj.last_name, userObj.email,userObj.photo_url, userObj.is_admin]);

    return userQuery.rows[0];
  }

  static async getUsers(){
    const userQuery = await db.query(`
    SELECT username, first_name, last_name, email 
    FROM users`);

    return userQuery.rows;
  }

  static async getSingleUser(username){
    const userQuery = await db.query(`
    SELECT username, first_name, last_name, email, photo_url, is_admin
    FROM users
    WHERE username = $1`, [username]);

    if(!userQuery.rowCount){
      throw new ExpressError(`${ username } not found`, 404);
    }

    const jobQuery = await db.query(`
    SELECT a.job_id, a.state, j.title, j.company_handle
    FROM applications a
    JOIN jobs j
    ON a.job_id = j.id
    WHERE username=$1`,
    [username]);

    return { user: userQuery.rows[0], jobs: jobQuery.rows };
  }

  static async updateUser(updatedData){
    const userQuery = await db.query(updatedData.query, updatedData.values);
    if(!userQuery.rowCount){
      throw new ExpressError(`${ updatedData.values[updatedData.values.length-1] } not found`, 404);
    }
    const { username, first_name, last_name, email, photo_url } = userQuery.rows[0];
    return { username, first_name, last_name, email, photo_url };
  }

  static async deleteUser(username){
    const userQuery = await db.query(`
    DELETE FROM users
    WHERE username = $1
    RETURNING username
    `, [username]);

    if(!userQuery.rowCount){
      throw new ExpressError(`${ username } not found`, 404);
    }

    return userQuery.rows[0];
  }
  
  static async updateAdminStatus(username){
    const userQuery = await db.query(`
    UPDATE users 
    SET is_admin = CASE WHEN is_admin IS false THEN true
    ELSE false
    END 
    where username = $1
    RETURNING username
    `, [username]);

    return userQuery.rows[0]
  
  } 

}

module.exports = User;