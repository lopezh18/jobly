process.env.NODE_ENV === "test";

const request = require('supertest');
const db = require('../../db');
const app = require('../../app');

beforeEach(async function () {
  await db.query(`
    DROP TABLE IF EXISTS companies cascade;
    DROP TABLE IF EXISTS jobs;
    DROP TABLE IF EXISTS users;
    
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
  
  CREATE TABLE users (
      username TEXT PRIMARY KEY, 
      password TEXT NOT NULL, 
      first_name TEXT NOT NULL, 
      last_name TEXT NOT NULL, 
      email TEXT NOT NULL UNIQUE, 
      photo_url TEXT, 
      is_admin BOOLEAN DEFAULT FALSE NOT NULL
  );

    INSERT INTO companies (handle, name, num_employees, description, logo_url)
    VALUES ('haha', 'greg', '2', 'we are live', 'http://www.www.com'),
            ('cheater', 'orlando', '2', 'we are across the table', 'http://www.orlando.com');

    INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
    VALUES ('game developer', '300', '0.8', 'haha', '04/04/04'),
            ('game tester', '400', '0.4', 'cheater', '04/04/04');

    INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES('danielrox', 'bestgroup', 'daniel', 'im', 'daniel@gmail.com', 'https:www.google.com', true);
  `);
});

afterEach(async function () {
  await db.query(`
    TRUNCATE TABLE companies, jobs, users
    `);
});

afterAll(function () {
  db.end();
});

describe('GET /users', function () {
  test('We can properly get a list of all users',
    async function () {
      let response2 = await request(app).get('/users');
      expect(response2.statusCode).toBe(200);
      expect(response2.body.users).toHaveLength(1);
      expect(response2.body.users).toEqual([{
        "username": "danielrox",
        "first_name": "daniel",
        "last_name": "im",
        "email": "daniel@gmail.com"
      }]);

    });
});


describe('POST /users', function () {
  test('We can properly add a new user to our database', async function () {
    const response = await request(app).post('/users').send(
      {
        "username": "hello",
        "password": "thankyou",
        "first_name": "haley",
        "last_name": "lopez",
        "email": "haley@gmail.com", 
        "photo_url": "https:www.google.com",
        "is_admin": false
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.user.username).toEqual('hello');

    const retrievalResponse = await request(app).get('/users');
    expect(retrievalResponse.statusCode).toBe(200);
    expect(retrievalResponse.body.users).toHaveLength(2);
  });

  test('We will throw an error if our req.body schema is unaligned', async function () {
    const badResponse = await request(app).post('/users').send(
      {
        "password": "heeey",
        "first_name": "orlando",
        "last_name": "orlando",
        "email": "orlando@gmail.com"
      });

    expect(badResponse.statusCode).toBe(400);
    expect(badResponse.body).toHaveProperty('message');
    expect(badResponse.body).toHaveProperty('status');
  });
});

describe('GET /users/:username', function () {
  test(`We can properly get a user's information by their username`, async function () {
    const response = await request(app).get('/users/danielrox');
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      "email": "daniel@gmail.com", 
      "first_name": "daniel", 
      "last_name":"im", 
      "photo_url": "https:www.google.com",
      "username": "danielrox"
    });

    const badResponse = await request(app).get('/users/haley');
    expect(badResponse.statusCode).toBe(404);
  });
});

describe('PATCH /:username', function () {
  test('We can properly edit a user\'s information by their username', async function () {
    const response = await request(app).patch('/users/danielrox').send(
      {
        "first_name": "haley",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual(
      {
        "email": "daniel@gmail.com", 
        "first_name": "haley", 
        "last_name":"im", 
        "photo_url": "https:www.google.com",
        "username": "danielrox"
      });

    const retrieve = await request(app).get('/users/danielrox');
    expect(retrieve.statusCode).toBe(200);
    expect(retrieve.body.user).toEqual(
      {
        "email": "daniel@gmail.com", 
        "first_name": "haley", 
        "last_name":"im", 
        "photo_url": "https:www.google.com",
        "username": "danielrox", 
      });
  });

  test('We will throw an error if our req.body schema is unaligned', async function () {
    const badPatch = await request(app).patch('/users/haleyrox').send(
      {
        "first_name": "beyonce"
      }
    );
    expect(badPatch.statusCode).toBe(404);
    expect(badPatch.body).toHaveProperty('message');
    expect(badPatch.body).toHaveProperty('status');
  });
});

describe('DELETE /:id', function () {
  test('We can properly delete a user from our database, by their username', async function () {
    const response = await request(app).delete('/users/danielrox');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("danielrox has been deleted");

    const retrieval = await request(app).get('/users/danielrox');
    expect(retrieval.statusCode).toBe(404);
  });
});