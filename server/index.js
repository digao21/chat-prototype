var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat/:chatId', function(req, res) {
  res.send({messages: db.getChatMessages(req.params.chatId) });
});

app.get('http://localhost:3000/user/:userId/unreaded-messages', function(req, res) {

});

io.on('connection', function(socket) {

  socket.on('init', function(userId) {
    console.log("User connected: "+userId);
    db.saveSocketFromUser(userId, socket);
  });

  socket.on('chat_message', function(msg) {
    console.log("[new message] - chat: %s; from: %s; content: %s", msg.chat, msg.from, msg.content);
    db.saveMessage(msg);
  });

  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
