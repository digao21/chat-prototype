'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.user = $rootScope.user;
  $scope.unreadedChats = [];
  $scope.chat = {};

  $http.get('http://localhost:3000/user/' + $rootScope.user)
  .then(
  function success(res) {
    $scope.user = getUserFromUserDto( res.data );
    $rootScope.socket.emit('init', $scope.user.id);
  },
  function fail(res) {
    console.log("[FAIL] - request for user", res);
  });

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
}])

function getUserFromUserDto (userDto) {
  const user = {
    id: userDto.id,
    chat: {},
    unreadedChats: userDto.unreadedChats
  };

  return user;
}
