angular
  .module("login", [])
  .controller("Login", ["$rootScope","$scope","$location", function($rootScope, $scope, $location) {
    $scope.submit = function () {
      console.log("User", $scope.user);
      console.log("Password", $scope.password);
      $rootScope.user = $scope.user;
      $rootScope.socket = io('http://localhost:3000').emit('init', $scope.user);
      $location.path('/chat');
    }
  }]);