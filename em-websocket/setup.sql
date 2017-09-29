-- DROP TABLES
DROP TABLE chats_users;
DROP TABLE unreaded_chats_users;
DROP TABLE messages;
DROP TABLE users;
DROP TABLE chats;

-- CREATE TABLE USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username varchar(80),
  password varchar(80)
);

INSERT INTO users (username, password) VALUES
('usr0', 'psw0'),
('usr1', 'psw1'),
('usr2', 'psw2'),
('usr9', 'psw9');

-- CREATE TABLE CHATS
CREATE TABLE chats (
  id SERIAL PRIMARY KEY
);

INSERT INTO chats VALUES
(default),
(default),
(default),
(default);

-- CREATE RELATIONAL TABLE CHATS-USERS
CREATE TABLE chats_users (
  chat_id integer REFERENCES chats (id),
  user_id integer REFERENCES users (id)
);

INSERT INTO chats_users (chat_id, user_id) VALUES
(1,1),
(1,2),
(2,1),
(3,3);

-- CREATE RELATIONAL TABLE UNREADED_CHATS-USERS
CREATE TABLE unreaded_chats_users (
  chat_id integer REFERENCES chats (id),
  user_id integer REFERENCES users (id)
);

INSERT INTO unreaded_chats_users (chat_id, user_id) VALUES
(1,1),
(1,2);

-- CREATE TABLE MESSAGES
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id integer REFERENCES chats (id),
  user_id integer REFERENCES users (id),
  content varchar(80)
);

INSERT INTO messages (chat_id, user_id, content) VALUES
(1,1,'Hello usr1'),
(1,2,'Hello usr0'),
(2,1,'Hello?'),
(3,3,'Hello?');
