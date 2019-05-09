const db = require('../db');
const ExpressError = require('../helpers/expressError');

class Job {

  static async searchJobs(search = '%%', minSalary = 0, minEquity = 0) {

    search = '%' + search.toLowerCase() + '%';

    let jobQuery = await db.query(`
            SELECT title, company_handle
            FROM jobs
            WHERE title LIKE $1 
            AND salary >= $2
            AND equity >= $3
            ORDER BY date_posted`,
    [search, minSalary, minEquity]);

    return jobQuery.rows;
  }

  static async createJob(jobObj) {
    const jobQuery = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
    [jobObj.title,
      jobObj.salary,
      jobObj.equity,
      jobObj.company_handle,
      jobObj.date_posted]);
    
    return jobQuery.rows[0];
  }

  static async getJob(id) {
    const jobQuery = await db.query(`
      SELECT * 
      FROM jobs
      WHERE id = $1`,
    [id]);

    if(!jobQuery.rows.length) {
      throw new ExpressError('ID Not Found', 404);
    }

    return jobQuery.rows[0];
  }

  static async patchJobInfo(updateObj) {
    const jobQuery = await db.query(updateObj.query, updateObj.values);

    if (!jobQuery.rows.length) {
      throw new ExpressError('Job not Found', 404);
    }

    return jobQuery.rows[0];
  }

  static async deleteJob(id) {
    const jobQuery = await db.query(`
    DELETE FROM jobs
    WHERE id = $1
    RETURNING *
    `, [id]);

    if (!jobQuery.rows.length) {
      throw new ExpressError('Job not Found', 404);
    }

    return jobQuery.rows[0];
  }
}

module.exports = Job;