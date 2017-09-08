"use strict";

const db = module.exports = {
  users: {},
  chats: {}
};

db.findUser = function (userId) {
  return db.users[userId];
}


db.saveSocketFromUser = function (userId, socket) {
  if(db.users[userId] === undefined) db.users[userId] = {};
  db.users[userId].socket = socket;
}

db.newMessage = function (msg) {
  db.chats[msg.chatId].push(msg);
}
