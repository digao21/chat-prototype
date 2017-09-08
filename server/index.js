var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

  socket.on('init', function(userId) {
    console.log("User connected: "+userId);
    db.saveSocketFromUser(userId, socket);
  });

  socket.on('chat_message', function(msg) {
//    console.log('[new message] - chat: '+msg.chat+'; from: '+msg.from+"; content: "+msg.content);
    console.log("[new message] - chat: %s; from: %s; content: %s", msg.chat, msg.from, msg.content);
    socket.emit('chat_message',msg);
  });

  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
