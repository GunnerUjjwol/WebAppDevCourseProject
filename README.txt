----------------------------
DATABASE INITIALIZATION QUERIES
-----
##USERS TABLE
-----

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password CHAR(60) NOT NULL
);

------------

-----
##REPORT TABLE
reportType - '1' indicates morningReport and '2' indicates 'eveningReport'
-----
CREATE TABLE report (
  id SERIAL PRIMARY KEY,
  reportType INTEGER,
  date DATE,
  sleepDuration NUMERIC(100, 2),
  genericMood INTEGER,
  sleepQuality INTEGER,
  studyDuration NUMERIC(100,2),
  exerciseDuration NUMERIC(100,2),
  regularity INTEGER,
  user_id INTEGER REFERENCES users(id)
);


-----------------------
COMMAND TO RUN THE DENO APP
-----------------
deno run --unstable --allow-all app.js -d ${DATABASE_URL} -p ${PORT}

where DATABASE_URL must be replaced with the database
similarly, PORT can be specified by adding args "-p ${PORT}". These segment can be excluded and the port will default to 7777


-------------------------
THE DEPLOYED VERSION OF THE APP CAN BE FOUND AT
----------------------
https://web-app-dev-course-project.herokuapp.com/
---
------------------------
