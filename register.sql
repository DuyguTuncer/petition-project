
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS signatures;
-- DROP TABLE IF EXISTS profile;

  CREATE TABLE users(
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL,
     last VARCHAR NOT NULL,
     email_address VARCHAR UNIQUE NOT NULL,
     hashed_password VARCHAR NOT NULL
 );

   CREATE TABLE signatures(
     id SERIAL PRIMARY KEY, 
     signature VARCHAR NOT NULL,
     user_id INT NOT NULL REFERENCES users(id)
 );


CREATE TABLE profiles (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age       INT,
    city      TEXT,
    homepage  TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




