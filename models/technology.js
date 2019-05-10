const db = require('../db');
const ExpressError = require('../helpers/expressError');

class Technology{

  static async addTechnology(job_id, language_name) {
    let response = await db.query(`
      INSERT INTO technologies (job_id, language_name)
      VALUES ($1, $2)
      RETURNING *`,
    [job_id, language_name]);

    if (!response.rowCount) {
      throw new ExpressError('LANGUAGE DOES NOT EXIST', 404);
    }
    
    return response.rows[0];
  }
}

module.exports = Technology;