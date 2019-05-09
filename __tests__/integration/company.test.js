process.env.NODE_ENV === "test";

const request = require('supertest');
const db = require('../../db');
const app = require('../../app');


beforeAll(async function () {
  await db.query(`
    DROP TABLE IF EXISTS companies;

    CREATE TABLE companies (
        handle TEXT PRIMARY KEY, 
        name TEXT NOT NULL, 
        num_employees INTEGER,
        description TEXT, 
        logo_url TEXT
    );
    `);
});

beforeEach(async function () {
  await db.query(`
    INSERT INTO companies (handle, name, num_employees, description, logo_url)
    VALUES ('haha', 'greg', '2', 'we are live', 'http://www.www.com'),
            ('cheater', 'orlando', '2', 'we are across the table', 'http://www.orlando.com')
    `);
});

afterEach(async function () {
  await db.query(`
    TRUNCATE TABLE companies
    `);
});

afterAll(function () {
  db.end();
});

describe('GET /companies', function () {
  test('We can properly get a list of all companies with search parameters as queries',
    async function () {
      let response = await request(app).get('/companies?search=ha');
      expect(response.statusCode).toBe(200);
      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0]).toEqual({
        "handle": "haha",
        "name": "greg"
      });
    });

  test('We can properly get a list of all companies with no search parameters',
    async function () {
      let response2 = await request(app).get('/companies');
      expect(response2.statusCode).toBe(200);
      expect(response2.body.companies).toHaveLength(2);
      expect(response2.body.companies).toEqual([
        {
          "handle": "haha",
          "name": "greg"
        },
        {
          "handle": "cheater",
          "name": "orlando"
        }
      ]);

    });

});

describe('POST /companies', function () {
  test('We can properly add a new company to our database', async function () {
    const response = await request(app).post('/companies').send(
      {
        "handle": "bestgroup",
        "name": "dan",
        "num_employees": 5006,
        "description": "great progress",
        "logo_url": "http://www.google.com"
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.company).toEqual(
      {
        "handle": "bestgroup",
        "name": "dan",
        "num_employees": 5006,
        "description": "great progress",
        "logo_url": "http://www.google.com"
      });

    const retrievalResponse = await request(app).get('/companies');
    expect(retrievalResponse.statusCode).toBe(200);
    expect(retrievalResponse.body.companies).toHaveLength(3);

  });
  test('We will throw an error if our req.body schema is unaligned', async function () {
    const badResponse = await request(app).post('/companies').send({
      "name": "dan",
      "num_employees": "5006",
      "description": "great progress",
      "logo_url": "http://www.google.com"
    });
    expect(badResponse.statusCode).toBe(400);
    expect(badResponse.body).toHaveProperty('message');
    expect(badResponse.body).toHaveProperty('status');
  });
});

describe('GET /companies/:handle', function () {
  test(`We can properly get a company's information by its handle`, async function () {
    const response = await request(app).get('/companies/haha');
    expect(response.statusCode).toBe(200);
    expect(response.body.company).toBeTruthy();
    expect(response.body.company).toEqual({
      "handle": "haha",
      "name": "greg",
      "num_employees": 2,
      "description": "we are live",
      "logo_url": "http://www.www.com"
    });

    const badResponse = await request(app).get('/companies/cooooo');
    expect(badResponse.statusCode).toBe(404);
  });
});

describe('PATCH /:handle', function () {
  test('We can properly edit a company\'s information by its handle', async function () {
    const response = await request(app).patch('/companies/haha').send(
      {
        "name": "bob",
        "num_employees": 20000,
        "description": "we just got our grant",
        "logo_url": "http://www.www.www.www.www.www.com"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.company).toEqual({
      "handle": "haha",
      "name": "bob",
      "num_employees": 20000,
      "description": "we just got our grant",
      "logo_url": "http://www.www.www.www.www.www.com"
    });

    const retrieve = await request(app).get('/companies/haha');
    expect(retrieve.statusCode).toBe(200);
    expect(retrieve.body.company).toEqual({
      "handle": "haha",
      "name": "bob",
      "num_employees": 20000,
      "description": "we just got our grant",
      "logo_url": "http://www.www.www.www.www.www.com"
    });
  });
});

describe('DELETE /:handle', function () {
  test('We can properly delete a company from our database, by its handle', async function () {
    const response = await request(app).delete('/companies/haha');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("haha was deleted");

    const retrieval = await request(app).get('/companies/haha');
    expect(retrieval.statusCode).toBe(404);
  });

});