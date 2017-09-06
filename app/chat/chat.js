'use strict';

angular.module('Chat', ['ngRoute', 'pubnub.angular.service'])

.run(['Pubnub', function (Pubnub) {
  Pubnub.init({
    publishKey : 'pub-c-2d6c5e89-53bf-448b-949d-82c17bb9e1b7',
    subscribeKey : 'sub-c-a2aa4778-8e58-11e7-867b-0a31f78815ec'
  });
}])

.controller('Chat', ['$scope', '$rootScope', 'Pubnub', function($scope, $rootScope, Pubnub) {
  $scope.user = $rootScope.user;

  $scope.init = init;
  $scope.init();

  function init() {
    // Subscribe to my channel
    Pubnub.subscribe({
      channels: [$scope.user],
      triggerEvents: ['message']
    })

    // Add event listener to my channel
    $rootScope.$on(Pubnub.getMessageEventNameFor($scope.user), function (ngEvent, envelope) {
      $scope.$apply(function () {
        if (envelope.message.from === $scope.chatWith) {
          if (envelope.message.status === 'unreaded')
            $scope.messages.push(envelope.message);

        } else {
          if ($scope.unreadedChats[envelope.message.from] === undefined)
            $scope.unreadedChats[envelope.message.from] = [];
          $scope.unreadedChats[envelope.message.from].push(envelope.message);
        }
      });
    });

    // Get unreaded messages
    Pubnub.history({
        channel: $scope.user,
        reverse: false,            // false is the default
        count: 100,                // 100 is the default
        stringifiedTimeToken: true // false is the default
      },
      function callback (status, response) {
        if (status.error) {
          console.log(status);
          console.log(response);
          return;
        }

        // Filtering unreaded messages
        var buff = {};
        response.messages.forEach(function(message){
          if (message === undefined) return;
          message = message.entry;
          console.log(message);

          if (buff[message.id] === undefined)
            buff[message.id] = message;

          if (message.status === 'readed')
            buff[message.id] = message;
        });

        var messages = [];
        for(var key in buff) {
          if (key === undefined) continue;
          messages.push(buff[key]);
        }

        $scope.$apply( function () {
          $scope.unreadedChats = {};
          messages.forEach(function(message) {
            if (message === undefined) return;

            if ($scope.unreadedChats[message.from] === undefined)
              $scope.unreadedChats[message.from] = [];
              $scope.unreadedChats[message.from].push(message);
          });
        });
      }
    );
  }

  $scope.sendMessage = function(){
    var message = {
      id: Date.now()+$scope.user,
      from: $scope.user,
      to:   $scope.chatWith,
      content: $scope.messageContent,
      status: 'unreaded'
    };

    if (message.to !== $scope.user)
      $scope.messages.push(message);

    Pubnub.publish({
        channel: $scope.chatWith,
        message: message
      },
      function callback (status, response){
        if (status.error) {
          console.log(status);
          console.log(response);
        }
      }
    ); 

    Pubnub.publish({
        channel: chatFromUsers($scope.user, $scope.chatWith),
        message: message
      },
      function callback (status, response){
        if (status.error) {
          console.log(status);
          console.log(response);
        }
      }
    ); 
  };

  $scope.openChat = function(){ 
    $scope.chatWith = $scope.searchUser;

    Pubnub.history({
        channel: chatFromUsers($scope.user ,$scope.chatWith),
        reverse: false,            // false is the default
        count: 100,                // 100 is the default
        stringifiedTimeToken: true // false is the default
      },
      function (status, response) {
        // handle status, response
        if (status.error) {
          console.log(status);
          console.log(response);
          return;
        }

        $scope.$apply( function () {
          $scope.messages = response.messages.map(function(msg){return msg.entry;});        

          // Delete messages from unreaded chat
          console.log("Deleting");
          console.log($scope.unreadedChats[$scope.chatWith]);
          if ($scope.unreadedChats[$scope.chatWith] !== undefined) {
          $scope.unreadedChats[$scope.chatWith].forEach(function deleteFromMyChannel(message){
              message.status = "readed";
              Pubnub.publish({
                  channel: $scope.user,
                  message: message
                },
                function callback (status, response){
                  if (status.error) {
                    console.log(status);
                    console.log(response);
                  }
                }
              );
            });
            delete $scope.unreadedChats[$scope.chatWith];
          }
        });
      }
    );
  }; 

}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', [function() {

}]);

function chatFromUsers(userA, userB) {
  if (userA < userB)
    return userA + userB;

  return userB + userA;
}

/*
  // Unsubscribe first
  Pubnub.unsubscribe({
    channels: [$scope.oldSubscribeChannel]
  });

  $scope.oldSubscribeChannel = $scope.subscribeChannel;
  $scope.closure();

  // Subscribe
  Pubnub.subscribe({
    channels: [$scope.subscribeChannel],
    triggerEvents: ['message']
  })

  $scope.closure = $rootScope.$on(Pubnub.getMessageEventNameFor($scope.subscribeChannel), function (ngEvent, envelope) {
    $scope.$apply(function () {
      // add message to the messages list
      var channel = $scope.channels[$scope.subscribeChannel];
      channel.push(envelope.message);
      console.log(channel);
    });
  });
*/
