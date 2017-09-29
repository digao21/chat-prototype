'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.user = {};
  $scope.unreadedChats = [];
  $scope.chat = {};

  $scope.socket = new WebSocket("ws://localhost:8081");

  $scope.socket.onopen    = socketOnOpen;
  $scope.socket.onmessage = socketOnMessage;
  $scope.socket.onclose   = socketOnClose;

  $scope.sendMessage = sendMessage
  $scope.openChat = openChat

  function sendMessage () {
    var msg = {
      event: "NEW_MSG_S",
      chatId: $scope.chat.id,
      sender: $scope.user.id,
      content: $scope.messageContent
    }

    $scope.socket.send( JSON.stringify(msg) );
  }

  function openChat () {
    var chat = getChatWithUser($scope.user.chats, $scope.searchUser);

    if (chat) {
      console.log("Chat is defined");

      var msg = {
        event: "GET_CHAT",
        chatId: chat.id
      }

      $scope.socket.send( JSON.stringify(msg) );
    }

    // chat is undefined
    else {
      console.log("Chat is undefined");

      var msg = {
        event: "CREATE_CHAT",
        users: [$scope.user.username, $scope.searchUser]
      }

      $scope.socket.send( JSON.stringify(msg) );
    }
  }

  function socketOnOpen () {
    console.log("[SOCKET CONNECTION]");

    var initMsg = {
      event: "INIT_CONNECTION",
      userId: $rootScope.userId
    }

    $scope.socket.send( JSON.stringify(initMsg) );
  }

  function socketOnMessage (evt) {
    console.log("[ON MESSAGE]");

    var msg = JSON.parse( evt.data );

    switch (msg.event) {
      case "NEW_MSG_C":           newMsg(msg);            break;
      case "NEW_CHAT":            newChat(msg);           break;
      case "USER_ONLINE":         userOnline(msg);        break;
      case "USER_OFFLINE":        userOffline(msg);       break;
      case "GET_CHAT_RES":        getChatRes(msg);        break;
      case "CREATE_CHAT_RES":     createChatRes(msg);     break;
      case "INIT_CONNECTION_RES": initConnectionRes(msg); break;
      default: break;
    }
  }

  function socketOnClose () {
    console.log("[ON CLOSE]");
  }

  function userOnline(data) {
    console.log("[USER_ONLINE]");
    $scope.$apply(function(){
      $scope.user.usersOnline.push( data.user );
    });
  }

  function userOffline(data) {
    console.log("[USER_OFFLINE]");

    $scope.$apply(function(){
      $scope.user.usersOnline = $scope.user.usersOnline.filter(function(user){
        return user.id !== data.user.id;
      });
    });
  }

  function newMsg(data) {
    console.log("[NEW_MSG_C]");
    var msg = data.message;

    // Chat is open
    if ($scope.chat.id === msg.chatId) {
      $scope.$apply(function(){
        $scope.chat.messages.push( msg );

        var ackMsg = {};

        ackMsg["event"]  = "NEW_MSG_C_ACK"
        ackMsg["chatId"] = msg.chatId;
        ackMsg["userId"] = $scope.user.id;

        $scope.socket.send( JSON.stringify(ackMsg) );
      });
    }

    // Chat is closed
    else {
      $scope.user.chats.forEach(function(chat){
        if (chat.id === msg.chatId) {
          $scope.$apply(function(){
            $scope.user.unreadedChats.push(chat);
          });
        }
      });
    }
  }

  function newChat(msg) {
    console.log("[NEW_CHAT]");
    $scope.user.chats.push( msg.chat );
  }

  function initConnectionRes(msg) {
    console.log("[INIT_CONNECTION_RES]");
    console.log(msg.user);
    $scope.$apply(function(){
      $scope.user = msg.user;
    });
  }

  function getChatRes(msg) {
    console.log("[GET_CHAT_RES]");
    $scope.$apply(function(){
      $scope.chat = msg.chat;
      $scope.chatWith = $scope.searchUser;
      $scope.searchUser = "";

      $scope.user.unreadedChats = $scope.user.unreadedChats.filter(function(chat){
        return chat.id !== msg.chat.id;
      });
    });
  }

  function createChatRes(msg) {
    console.log("[CREATE_CHAT_RES]");
    $scope.$apply(function(){
      $scope.chat = msg.chat;
      $scope.chatWith = $scope.searchUser;
      $scope.searchUser = "";
    });
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

  $scope.sendMessage = function(){
    if ($scope.chat.id === undefined) return;

    const message = {
      channel: "CHAT",
      chatId: $scope.chat.id,
      sender: $scope.user.id,
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
*/
