"use strict";

const db = module.exports = {
  users:   {},
  chats:   {},
  sockets: {}
};

db.saveSocketFromUser = function (userId, socket) {
  db.users[userId].socket = socket;
  db.sockets[socket.id] = userId;
}

db.deleteSocket = function (socket) {
  const userId = db.sockets[ socket.id ];
  db.users[ userId ].socket = undefined;
  delete db.sockets[ socket.id ];
}

db.getUserIdFromSocket = function (socket) {
  return db.sockets[ socket.id ];
}

db.saveUnreadedChat = function (userId, chatId) {
  if ( !db.users[ userId ].unreadedChats.has( chatId ) )
    db.users[ userId ].unreadedChats.add( chatId );
}

db.setUserOnline = function (userId, isOn) {
  db.users[ userId ].online = isOn;
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

db.isUserOnline = function (userId) {
  return db.users[ userId ].online;
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

db.addChatToUser = function (user, chat) {
  db.users[ user.id ].chats.add( chat.id );
}
