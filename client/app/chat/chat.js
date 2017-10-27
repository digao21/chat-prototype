'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$rootScope', '$scope', 'ChatService', function($rootScope, $scope, ChatService) {
  var user = $rootScope.user;

  $scope.user = user;
  $scope.username = user.name; // Change username for name
  $scope.searchUser = "";
  $scope.chats = [];
  $scope.myChat = {};

  $scope.sendMessage = sendMessage
  $scope.openChat = openChat

  var chatCtr = this;
  chatCtr["OPEN_CONNECTION"] = onOpen;
  chatCtr["GET_USER_RES"] = getUserRes;
  chatCtr["GET_CHAT_RES"] = getChatRes;
  chatCtr["NEW_MSG"] = newMsg;

  ChatService.addListener( chatCtr, [
    'OPEN_CONNECTION',
    'GET_USER_RES',
    'GET_CHAT_RES',
    'NEW_MSG'
  ]);

  if (ChatService.getConnectionState() === "OPEN")
    ChatService.getUser( user.id );

  function sendMessage () {
    var chatId = $scope.myChat.id;
    var sender = $scope.user.id;
    var content = $scope.messageContent;

    ChatService.sendChatMsg( chatId, sender, content );
  }

  function openChat () {
    var searchUser = $scope.searchUser.toLowerCase();
    var chats = [];

    if (searchUser === "") return;

    $scope.chats.forEach(function(chat) {
      if (!chat.chatWith) return;
      var cUser = chat.chatWith.toLowerCase();

      if (cUser.search( searchUser ) !== -1)
        chats.push(chat);
    });

    if(chats.length <= 0) {
      alert("User not found");
      return;
    }

    if(chats.length >= 2) {
      alert("Ambiguous user");
      alert;
    }

    ChatService.getChat( chats[0].id );
  }

  function onOpen () {
    ChatService.getUser( $scope.user.id );
  }

  function getUserRes(msg) {
    var chats = [];
    var user = msg.user;

    user.chats.forEach(function(chat) {
      var myChat = {};

      myChat.id = chat.id;
      myChat.chatWith = (chat.users[0].name != $scope.user.name) ?
                        chat.users[0].name :
                        chat.users[1].name;
       

      chats.push(myChat);
    });

    $scope.$apply(function(){
      $scope.chats = chats;
    });
  }

  function getChatRes(msg) {
    var chat = msg.chat;
    console.log(chat);

    $scope.$apply(function(){
      $scope.chatWith = (chat.users[0].name != $scope.user.name) ?
                        chat.users[0].name :
                        chat.users[1].name;
      $scope.myChat = chat;

      ChatService.chatReaded(chat.id, $scope.user.id);
    });
  }

  function newMsg(data) {
    var msg = data.message;
    console.log(msg);

    if(msg.chatId === $scope.myChat.id) {
      if(msg.senderId !== $scope.user.id)
        ChatService.msgReaded(msg.id);

      $scope.$apply(function(){
        $scope.myChat.messages.push(msg);
      });
    }
  }
}])

/*
  function socketOnMessage (evt) {


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


function getChatWithUser( chats, username ) {
  var myChat = undefined;

  chats.forEach( function (chat) {
    chat.users.forEach( function (user) { 
      if (user.username === username) myChat = chat;
    });
  });

  return myChat;
}
*/
