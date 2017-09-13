var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/chat/two-users/:userId1/:userId2', function(req, res) {
  var userA = {id: req.params.userId1};
  var userB = {id: req.params.userId2};
  var chatId = getChatId(userA, userB);

  var chat = db.getChat( chatId );

  if (chat === undefined) chat = createChat( chatId, userA, userB );

  const chatDto = {
    id: chat.id,
    messages: chat.messages
  }

  res.send( chatDto );
});

app.get('/user/:userId', function(req, res) {
  var userId = req.params.userId;
  var user = db.getUser( userId );

  if (user === undefined) user = createUser( userId );
 
  const userDto = {
    id: user.id,
    unreadedChats: Array.from( user.unreadedChats )
  };

  res.send( userDto );
});

app.delete('/user/:userId/unreaded-chat/:chatId', function(req) {
  var userId = req.params.userId;
  var chatId = req.params.chatId;

  db.deleteUnreadedChat( userId, chatId );
});

io.on('connection', function(socket) {

  socket.on('init', function(userId) {
    console.log("User connected: "+userId);
    db.saveSocketFromUser(userId, socket);
  });

  socket.on('chat_message', function(msg) {
    console.log("[new message] - chatId: %s; senderId: %s; content: %s", msg.chatId, msg.senderId, msg.content);
    db.saveMessage(msg);

    const chat = db.getChat( msg.chatId );

    chat.usersId.forEach(function (userId) {
      if (userId === undefined) return;

      const user = db.getUser( userId );
      if (user.socket !== undefined && user.socket.connected) {
        user.socket.emit("chat_message", msg, function acknowledge(status){
          if (status === "UNREADED") db.saveUnreadedChat( userId, chat.id );
        });
      } else {
        db.saveUnreadedChat( userId, chat.id );
      }
    });
  });

  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getChatId (userA, userB) {
  if (userA.id < userB.id) return userA.id + userB.id;
  return userB.id + userA.id;
}

function createUser (userId) {
   var user = {
     id: userId,
     socket: undefined,
     unreadedChats: new Set()
   };
 
  db.saveUser( user );
  return user; 
}

function createChat (chatId, userA, userB) {
  const chat = { 
    id: chatId,
    usersId: [userA.id, userB.id],
    messages: []
  };

  if (db.getUser( userA.id ) === undefined) createUser( userA.id );
  if (db.getUser( userB.id ) === undefined) createUser( userB.id );

  db.saveChat( chat );
  return chat; 
}
