'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.user = $rootScope.user;
  $scope.messages = [];

  $rootScope.socket.on('chat_message', function(msg) {
    $scope.$apply(function(){
      if ($scope.openChat === msg.chat) {
        $scope.messages.push(msg);

      } else {
        if ($scope.unreadedChats[msg.chat] === undefined)
          $scope.unreadedChats[msg.chat] = []
        $scope.unreadedChats[msg.chat].push(msg);
      }
    });
  });

  $scope.sendMessage = function(){
    var message = {
      chat: $scope.openChat,
      from: $scope.user,
      content: $scope.messageContent
    };

    $rootScope.socket.emit('chat_message', message);
  };

  $scope.openChat = function(){
    $scope.openChat = $scope.chatWith;

    if ($scope.unreadedChats[msg.chat])
      $scope.messages = $scope.unreadedChats[msg.chat];

    else
      $scope.messages = [];
  }; 

}])

