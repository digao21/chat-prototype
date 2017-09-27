'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.user = $rootScope.user;
  $scope.unreadedChats = [];
  $scope.chat = {};

  $scope.socket = new WebSocket("ws://localhost:8081");

  $scope.socket.onopen = function () {
    console.log("socket connected");
    var initMsg = {
      channel: "INIT",
      userId: $scope.user.id
    }

    $scope.socket.send( JSON.stringify(initMsg) );
  }

  $scope.socket.onmessage = function (evt) {
    console.log("[NEW MSG]");
    var msg = JSON.parse( evt.data );

    switch (msg.channel) {
      case "CHAT":
        console.log("[CHAT %s] - sender: %s; content: %s", msg.chatId, msg.sender, msg.content);
        if ($scope.chat.id === msg.chatId) {
          $scope.$apply(function(){
            $scope.chat.messages.push (msg);
          });
        } else {
          console.log("chat.id: %s; msg.chatId: %s", $scope.chat.id, msg.chatId);
        }
        break;

      default: break;
    }
  }

  $scope.socket.onclose = function () {
    console.log("socket closed");
  }

  $scope.sendMessage = function(){
    if ($scope.chat.id === undefined) return;

    const message = {
      channel: "CHAT",
      chatId: $scope.chat.id,
      senderId: $scope.user.id,
      content: $scope.messageContent
    }

    $scope.socket.send( JSON.stringify(message) );
  }

  $scope.openChat = function(){
    var chat = getChatWithUser($scope.user.chats, $scope.searchUser);

    if (chat) {
      console.log("Chat is defined");

      $http.get('http://localhost:8080/chat/' + chat.id)
      .then(
      function success (res) {
        $scope.chatWith = $scope.searchUser;
        $scope.chat = res.data;
      },
      function error (err){
        console.log("[GET /chat/:chatId] - FAIL");
      });
    }

    // chat is undefined
    else {
      console.log("Chat is undefined");

      $http.get('http://localhost:8080/user/username/' + $scope.searchUser)
      .then(
      function success (res) {
        console.log("[GET /user/username/:username] - SUCCESS");
 
        $http.post('http://localhost:8080/chat/create', {users: [$scope.user.id, res.data.id]})
        .then(
        function success (res) {
          console.log("[GET /chat/create] - SUCCESS");
          console.log(res.data);
        },
        function error (err) {
          console.log("[GET /chat/create] - FAIL");
        });
      },
      function fail (err) {
        console.log("[GET /user/username/:username] - FAIL");
      });
    }
  }
}])

function getChatWithUser( chats, username ) {
  var myChat = undefined;

  chats.forEach( function (chat) {
    chat.users.forEach( function (user) { 
      if (user.username === username) myChat = chat;
    });
  });

  return myChat;
}

/*
  $rootScope.socket.on('chat_message', function(msg, ack) {
    $scope.$apply(function(){
      if ($scope.chat.id === msg.chatId) {
        $scope.chat.messages.push(msg);
        ack("READED");

      } else {
        var index = $scope.user.unreadedChats.indexOf( msg.chatId );
        if (index === -1) $scope.user.unreadedChats.push( msg.chatId );

        ack("UNREADED");
      }
    });
  });

  $rootScope.socket.on('user_status', function(msg) {
    console.log(msg);
    $scope.$apply(function(){
      var index = $scope.user.usersOnline.indexOf(msg.userId);
      if (index === -1 &&  msg.value) $scope.user.usersOnline.push( msg.userId );
      if (index !== -1 && !msg.value) $scope.user.usersOnline.splice( index, 1 );
    });
  }); 

  $scope.sendMessage = function(){
    var message = {
      chatId: $scope.chat.id,
      senderId: $scope.user.id,
      content: $scope.messageContent
    };

    $rootScope.socket.emit('chat_message', message);
  };

  $scope.openChat = function(){
    $scope.chatWith = $scope.searchUser;

    $http.get('http://localhost:3000/chat/two-users/' + $scope.user.id + '/' + $scope.chatWith)
    .then(
    function success(res) {
      $scope.chat = res.data;

      var index = $scope.user.unreadedChats.indexOf( $scope.chat.id );
      if (index > -1) $scope.user.unreadedChats.splice( index, 1 );

      $http.delete('http://localhost:3000/user/'+ $scope.user.id + '/unreaded-chat/' + $scope.chat.id);
    },
    function error(res) {
      console.log("Fail -", res);
    });
  }; 

function getUserFromUserDto (userDto) {
  const user = {
    id: userDto.id,
    chat: {},
    usersOnline: userDto.usersOnline,
    unreadedChats: userDto.unreadedChats
  };

  return user;
}
*/
