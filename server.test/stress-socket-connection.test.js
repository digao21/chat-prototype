'use strict'

const io = require('socket.io-client');
const http = require('http');

var maxDt = 0;

const initialMsg = {
  id: 0,
  content: 'message0'
}

class User {
  constructor (id) {
    this.id = id;
    this.init = false;
    this.socket = io('http://localhost:3000', { forceNew: true });

    const myUser = this;
    this.socket.on('chat_message', function(msg,ack) {
      var dt = Date.now() - msg.time;

      if (maxDt < dt) maxDt = dt;
      console.log('maxDt %s; dt %s', maxDt, dt);

      if (msg.senderId !== myUser.id) {
        setTimeout(function(){
          msg.id++;
          msg.content = "message" + msg.id;
          msg.time = Date.now();

          myUser.socket.emit('chat_message', msg);
        }, 1000);
      }

      ack("READED");
    });
  }

  initChanel () {
    const myUser = this;
    this.socket.emit('init', this.id, function acknowledge (status) {
      myUser.init = true;
    });
  }

  chatWith (userB) {
    const user = this;

    http.get('http://localhost:3000/chat/two-users/' + user.id + '/' + userB.id, function (res) {

      const bodyChunks = [];

      res
      .on('data', function(chunk) {
        bodyChunks.push(chunk);
      })
      .on('end', function() {
        user.chat = JSON.parse( Buffer.concat( bodyChunks ) );

        user.initChanel();
        userB.initChanel();

        user.startChat( userB );
      })
    });
  }

  startChat (userB) {
    const user = this;

    if (!user.init || !userB.init) {
      setTimeout(function(){user.startChat(userB);}, 500);
      return;
    }

    initialMsg.chatId   = user.chat.id;
    initialMsg.senderId = user.id;
    initialMsg.time = Date.now();

    user.socket.emit('chat_message', initialMsg); 
  }
}

function test_stress_server_with_multiple_connections (id) {
  if (id > 10000) return;
  new User(id).chatWith( new User(id+1) );
  setTimeout(function(){test_stress_server_with_multiple_connections( id+2 )}, 100);
}

test_stress_server_with_multiple_connections(1);
