'use strict';

angular.module('myApp.view1', ['ngRoute', 'pubnub.angular.service'])

.run(['Pubnub', function (Pubnub) {
  Pubnub.init({
    publishKey : 'pub-c-2d6c5e89-53bf-448b-949d-82c17bb9e1b7',
    subscribeKey : 'sub-c-a2aa4778-8e58-11e7-867b-0a31f78815ec'
  });
}])

.controller('Chat', ['$scope', '$rootScope', 'Pubnub', function($scope, $rootScope, Pubnub) {
  $scope.message = "";
  $scope.publishChannel = "";
  $scope.subscribeChannel = "";
  $scope.oldSubscribeChannel = "";
  $scope.closure = function(){};
  $scope.channels = {
    channel_1: [],
    channel_2: [],
    channel_3: [],
    channel_4: [],
  }


  $scope.updatePublishChannel = function(){
    console.log("New publish channel", $scope.publishChannel);
  };

  $scope.sendMessage = function(){
    console.log("Send message",$scope.message);
    Pubnub.publish({
        channel: $scope.publishChannel,
        message: $scope.message
      },
      function(status, response){
        if (status.error) {
          console.log(status);
          console.log(response);
        }
      }
    ); 
  };

  $scope.updateSubscribeChannel = function(){ 
    Pubnub.history({
        channel: $scope.subscribeChannel,
        reverse: false, // false is the default
        count: 100, // 100 is the default
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
          $scope.channels[$scope.subscribeChannel] = response.messages;        
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