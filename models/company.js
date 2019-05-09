const db = require('../db');
const ExpressError = require('../helpers/expressError');

class Company {

  static async searchCompanies(search = '%%', minEmployees = 0, maxEmployees = 10000) {
    if (+minEmployees > +maxEmployees) {
      throw new Error('Search Invalid: MinEmployees is greater than MaxEmployees', 400);
    }

    search = '%' + search.toLowerCase() + '%';

    let companyQuery = await db.query(`
            SELECT handle, name
            FROM companies
            WHERE handle LIKE $1 
            AND
            num_employees BETWEEN $2 AND $3`,
    [search, minEmployees, maxEmployees]);

    return companyQuery.rows;
  }

  static async newCompany(companyObj) {
    let companyQuery = await db.query(`
      INSERT INTO companies(handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
    [companyObj.handle.toLowerCase(),
      companyObj.name,
      companyObj.num_employees,
      companyObj.description,
      companyObj.logo_url]);

    return companyQuery.rows[0];
  }

  static async getCompany(handle) {
    let companyQuery = await db.query(`
      SELECT * 
      FROM companies
      WHERE handle=$1`,
    [handle]);

    if (!companyQuery.rows.length) {
      throw new ExpressError('Handle not Found', 404);
    }

    let jobQuery = await db.query(`
      SELECT id, title
      FROM jobs
      WHERE company_handle=$1`,
    [companyQuery.rows[0].handle]);

    return { company: companyQuery.rows[0], jobs: jobQuery.rows };
  }

  static async patchCompanyInfo(updateObj) {
    let companyQuery = await db.query(updateObj.query, updateObj.values);

    if (!companyQuery.rows.length) {
      throw new ExpressError('Handle not Found', 404);
    }

    return companyQuery.rows[0];
  }

  static async deleteCompany(handle) {
    let companyQuery = await db.query(`
        DELETE FROM companies
        WHERE handle = $1
        RETURNING *
        `, [handle]);

    if (!companyQuery.rows.length) {
      throw new ExpressError('Handle not Found', 404);
    }

    return companyQuery.rows[0];
  }
}

module.exports = Company;