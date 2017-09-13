"use strict";

const db = module.exports = {
  users: {},
  chats: {}
};

db.saveSocketFromUser = function (userId, socket) {
  db.users[userId].socket = socket;
}

db.saveUnreadedChat = function (userId, chatId) {
  if ( !db.users[ userId ].unreadedChats.has( chatId ) )
    db.users[ userId ].unreadedChats.add( chatId );
}

db.deleteUnreadedChat = function (userId, chatId) {
  db.users[ userId ].unreadedChats.delete( chatId );
}

db.saveUser = function (user) {
  db.users[ user.id ] = user;
}

db.getUser = function (userId) {
  return db.users[ userId ];
}

db.saveMessage = function (msg) {
  db.chats[msg.chatId].messages.push(msg);
}

db.getChat = function (chatId) {
  return db.chats[chatId];
}

db.saveChat = function (chat) {
  db.chats[ chat.id ] = chat;
}
