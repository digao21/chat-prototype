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

db.saveMessage = function (msg) {
  if (db.chats[msg.chat] === undefined) db.chats[msg.chat] = [];
  db.chats[msg.chat].push(msg);
}

db.getChatMessages = function (chatId) {
  return db.chats[chatId];
}

db.getUnreadedMessagesFrom = function (userId) {
  return 
}
