'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'pubnub.angular.service',
  'Chat',
  'myApp.view2',
  'login',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider
  .when('/',{
    templateUrl:'login/login.html',
    controller: 'Login'
  })
  .when('/chat',{
    templateUrl:'chat/chat.html',
    controller: 'Chat'
  })
  .otherwise({redirectTo: '/'});
}]);
