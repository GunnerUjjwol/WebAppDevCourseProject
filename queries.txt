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
