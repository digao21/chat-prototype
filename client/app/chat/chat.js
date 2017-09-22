'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.user = $rootScope.user;
  $scope.unreadedChats = [];
  $scope.chat = {};

  $scope.socket = new WebSocket("ws://localhost:8081");

  $scope.socket.onopen = function () {
    console.log("socket connected");
  }

  $scope.socket.onmessage = function (evt) {
    console.log("[evt] - data: %s", evt.data);
  }

  $scope.socket.onclose = function () {
    console.log("socket closed");
  }

  $scope.sendMessage = function(){}
  $scope.openChat = function(){}

}])

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
