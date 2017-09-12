'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.controller('Chat', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $scope.user = $rootScope.user;
  $scope.unreadedChats = {};
  $scope.messages = [];

  $http({
    method: 'GET',
    url: 'http://localhost:3000/user/'+$scope.user+'/unreaded-messages'
  }).then(function success(res){
    console.log("Get unreaded messages SUCCESS");
  }, function fail(res){
    console.log("Get unreaded messages FAIL");
  });

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
      chat: $scope.chatWith,
      from: $scope.user,
      content: $scope.messageContent
    };

    $rootScope.socket.emit('chat_message', message);
  };

  $scope.openChat = function(){
    $scope.chatWith = $scope.searchUser;


    $http({
      method: 'GET',
      url: 'http://localhost:3000/chat/'+$scope.chatWith,

    }).then(function successCallback(res) {
      $scope.messages = res.data.messages;
      delete $scope.unreadedChats[$scope.chatWith];

    }, function errorCallback(res) {
      console.log("Fail -", res);
    });

/*
    if ($scope.unreadedChats[$scope.openChat])
      $scope.messages = $scope.unreadedChats[$scope.openChat];

    else
      $scope.messages = [];
*/
  }; 

}])

