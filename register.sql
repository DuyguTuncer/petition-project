-- DROP TABLE IF EXISTS signatures;
-- DROP TABLE IF EXISTS users;

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


