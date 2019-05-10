const db = require('../db');
const ExpressError = require('../helpers/expressError');

class Application{

  static async jobStatus(username, job_id, state) {
    let response = await db.query(`
      INSERT INTO applications (username, job_id, state)
      VALUES ($1, $2, $3)
      RETURNING *`,
    [username, job_id, state]);

    if (!response.rowCount) {
      throw new ExpressError('USERNAME OR JOB ID DOES NOT EXIST', 404);
    }
    
    return response.rows[0];
  }
}

module.exports = Application;