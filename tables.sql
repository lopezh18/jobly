\c jobly

DROP TABLE IF EXISTS companies;
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

