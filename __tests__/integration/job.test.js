process.env.NODE_ENV === "test";

const request = require('supertest');
const db = require('../../db');
const app = require('../../app');


// beforeAll(async function () {
//   await db.query(`
//     DROP TABLE IF EXISTS companies cascade;
//     DROP TABLE IF EXISTS jobs;

//     CREATE TABLE companies (
//         handle TEXT PRIMARY KEY, 
//         name TEXT NOT NULL, 
//         num_employees INTEGER,
//         description TEXT, 
//         logo_url TEXT
//     );

//     CREATE TABLE jobs (
//         id SERIAL PRIMARY KEY, 
//         title TEXT NOT NULL, 
//         salary FLOAT NOT NULL, 
//         equity FLOAT NOT NULL CHECK (equity <= 1),
//         company_handle TEXT NOT NULL, 
//         FOREIGN KEY (company_handle) REFERENCES companies(handle),
//         date_posted DATE DEFAULT CURRENT_DATE
//     );
//     `);
// });

beforeEach(async function () {
  await db.query(`
    DROP TABLE IF EXISTS companies cascade;
    DROP TABLE IF EXISTS jobs;
    
    CREATE TABLE companies (
        handle TEXT PRIMARY KEY, 
        name TEXT NOT NULL, 
        num_employees INTEGER,
        description TEXT, 
        logo_url TEXT
    );
    
    CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL, 
        salary FLOAT NOT NULL, 
        equity FLOAT NOT NULL CHECK (equity <= 1),
        company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE, 
        date_posted DATE DEFAULT CURRENT_DATE
    );

    INSERT INTO companies (handle, name, num_employees, description, logo_url)
    VALUES ('haha', 'greg', '2', 'we are live', 'http://www.www.com'),
            ('cheater', 'orlando', '2', 'we are across the table', 'http://www.orlando.com');

    INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
    VALUES ('game developer', '300', '0.8', 'haha', '04/04/04'),
            ('game tester', '400', '0.4', 'cheater', '04/04/04');
  `);
});

afterEach(async function () {
  await db.query(`
    TRUNCATE TABLE companies, jobs
    `);
});

afterAll(function () {
  db.end();
});

describe('GET /jobs', function () {
  test('We can properly get a list of all jobs with no search parameters',
    async function () {
      let response2 = await request(app).get('/jobs');
      expect(response2.statusCode).toBe(200);
      expect(response2.body.jobs).toHaveLength(2);
      expect(response2.body.jobs).toEqual([
        {
          "title": "game developer",
          "company_handle": "haha",
        },
        {
          "title": "game tester",
          "company_handle": "cheater",
        }
      ]);

    });

  test('We can properly get a list of jobs that fulfill search query',
    async function () {
      let response = await request(app).get('/jobs?search=dev');
      expect(response.statusCode).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0]).toEqual({
        "title": "game developer",
        "company_handle": "haha"
      });
    });


  test('We can properly get a list of jobs that fulfill minSalary',
    async function () {
      let response = await request(app).get('/jobs?minSalary=350');
      expect(response.statusCode).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0]).toEqual({
        "title": "game tester",
        "company_handle": "cheater"
      });
    });

  test('We can properly get a list of jobs that fulfill minEquity',
    async function () {
      let response = await request(app).get('/jobs?minEquity=0.8');
      expect(response.statusCode).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0]).toEqual({
        "title": "game developer",
        "company_handle": "haha"
      });
    });

  test('We can properly get a list of jobs that fulfill multiple requirements',
    async function () {
      let response = await request(app).get('/jobs?search=gAmE&minSalary=300&minEquity=0.8');
      expect(response.statusCode).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0]).toEqual({
        "title": "game developer",
        "company_handle": "haha"
      });
    });
});

describe('POST /job', function () {
  test('We can properly add a new job to our database', async function () {
    const response = await request(app).post('/jobs').send(
      {
        "title": "hello",
        "salary": 9000009,
        "equity": 0.9,
        "company_handle": "haha",
        "date_posted": "04/04/04"
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.job.salary).toEqual(9000009);

    const retrievalResponse = await request(app).get('/jobs');
    expect(retrievalResponse.statusCode).toBe(200);
    expect(retrievalResponse.body.jobs).toHaveLength(3);

  });

  test('We will throw an error if our req.body schema is unaligned', async function () {
    const badResponse = await request(app).post('/jobs').send(
      {
        "title": "hello",
        "salary": 9000009,
        "company_handle": "bestgroup",
        "date_posted": "04/04/04"
      });
    expect(badResponse.statusCode).toBe(400);
    expect(badResponse.body).toHaveProperty('message');
    expect(badResponse.body).toHaveProperty('status');
  });
});

describe('GET /jobs/:id', function () {
  test(`We can properly get a job's information by its id`, async function () {
    const response = await request(app).get('/jobs/1');
    expect(response.statusCode).toBe(200);
    expect(response.body.job).toEqual({
      "id": 1,
      "title": "game developer",
      "salary": 300,
      "equity": 0.8,
      "company_handle": "haha",
      "date_posted": "2004-04-04T08:00:00.000Z"
    });

    const badResponse = await request(app).get('/jobs/50');
    expect(badResponse.statusCode).toBe(404);
  });
});

describe('PATCH /:id', function () {
  test('We can properly edit a job\'s information by its id', async function () {
    const response = await request(app).patch('/jobs/1').send(
      {
        "title": "game developer",
        "salary": 400000,
        "equity": 0.99,
        "company_handle": "cheater",
        "date_posted": "2004-04-04T08:00:00.000Z"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.job).toEqual(
      {
        "id": 1,
        "title": "game developer",
        "salary": 400000,
        "equity": 0.99,
        "company_handle": "cheater",
        "date_posted": "2004-04-04T08:00:00.000Z"
      });

    const retrieve = await request(app).get('/jobs/1');
    expect(retrieve.statusCode).toBe(200);
    expect(retrieve.body.job).toEqual(
      {
        "id": 1,
        "title": "game developer",
        "salary": 400000,
        "equity": 0.99,
        "company_handle": "cheater",
        "date_posted": "2004-04-04T08:00:00.000Z"
      });
  });
});

describe('DELETE /:id', function () {
  test('We can properly delete a job from our database, by its id', async function () {
    const response = await request(app).delete('/jobs/1');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Job game developer at ID: 1 was deleted");

    const retrieval = await request(app).get('/jobs/1');
    expect(retrieval.statusCode).toBe(404);
  });
});