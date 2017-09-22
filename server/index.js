var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/chat/two-users/:userId1/:userId2', function(req, res) {
  var userA = db.getUser( req.params.userId1 ) || createUser( req.params.userId1 );
  var userB = db.getUser( req.params.userId2 ) || createUser( req.params.userId2 );

  var chatId = getChatId(userA, userB);
  var chat = db.getChat( chatId ) || createChat( chatId, userA, userB );

  const chatDto = {
    id: chat.id,
    messages: chat.messages
  }

  res.send( chatDto );
});

app.get('/user/:userId', function(req, res) {
  var user = db.getUser( req.params.userId ) || createUser( req.params.userId );

  var usersOnline = new Set();
  user.chats.forEach(function (chatId) {
    var chat = db.getChat( chatId );
    if (db.isUserOnline( chat.usersId[0] )) usersOnline.add( chat.usersId[0] );
    if (db.isUserOnline( chat.usersId[1] )) usersOnline.add( chat.usersId[1] );
  });
 
  const userDto = {
    id: user.id,
    usersOnline: Array.from( usersOnline ),
    unreadedChats: Array.from( user.unreadedChats )
  };

  res.send( userDto );
});

app.delete('/user/:userId/unreaded-chat/:chatId', function(req) {
  var userId = req.params.userId;
  var chatId = req.params.chatId;

  db.deleteUnreadedChat( userId, chatId );
});

var total = 0;
io.on('connection', function(socket) {

  socket.on('init', function(userId, ack) {
    console.log("user connected %s; total %s", userId, ++total);
    db.saveSocketFromUser( userId, socket );
    db.setUserOnline( userId, true );

    broadcastUserChats (userId, function (socket) {
      socket.emit('user_status', {
        method: 'UPDATE',
        userId: userId,
        status: 'online',
        value:  true
      });
    });

    ack("OK");
  });

  socket.on('chat_message', function(msg) {
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
    const userId = db.getUserIdFromSocket( socket );
    if (userId !== undefined) {
      console.log('user disconnected; total %s', --total);
      db.setUserOnline( userId, false );
      db.deleteSocket( socket );

      broadcastUserChats (userId, function (socket) {
        socket.emit('user_status', {
          method: 'UPDATE',
          userId: userId,
          status: 'online',
          value:  false
        });
      });
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function broadcastUserChats (userId, fn) {
  var usersToNotify = new Set();
  db.getUser( userId ).chats.forEach( function (chatId) {
    usersToNotify.add( db.getChat( chatId ).usersId[0] );
    usersToNotify.add( db.getChat( chatId ).usersId[1] );
  });

  usersToNotify.delete(userId);
  usersToNotify.forEach( function (userId) {
    var user = db.getUser( userId );
    if (user.socket !== undefined && user.socket.connected)
      fn( user.socket ); 
  });
}

function getChatId (userA, userB) {
  if (userA.id < userB.id) return userA.id + userB.id;
  return userB.id + userA.id;
}

function createUser (userId) {
   var user = {
     id: userId,
     online: false,
     socket: undefined,
     chats: new Set(),
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

  db.saveChat( chat );
  db.addChatToUser( userA, chat );
  db.addChatToUser( userB, chat );

  if (userA.socket && userA.socket.connected) {
    userA.socket.emit('user_status', {
      method: 'UPDATE',
      userId: userB.id,
      status: 'online',
      value:  db.isUserOnline( userB.id )
    });
  }
  else {
    console.log("User %s not connected", userA.id);
    console.log(userA.socket);
  }

  if (userB.socket && userB.socket.connected) {
    userB.socket.emit('user_status', {
      method: 'UPDATE',
      userId: userA.id,
      status: 'online',
      value:  db.isUserOnline( userA.id )
    });
  }
  else {
    console.log("User %s not connected", userB.id);
    console.log(userB.socket);
  }

  return chat; 
}

function memoryAnalise() {
  var mem = process.memoryUsage();
  console.log("[memory] - rss: %s; heap-total: %s; heap-used: %s; external: %s", mem.rss, mem.heapTotal, mem.heapUsed, mem.external);
  setTimeout(memoryAnalise, 1000);
}
