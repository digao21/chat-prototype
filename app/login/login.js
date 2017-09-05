angular
  .module("login", [])
  .controller("Login", ["$rootScope","$scope","$location", function($rootScope, $scope, $location) {
    $scope.submit = function () {
      console.log("User", $scope.user);
      console.log("Password", $scope.password);
      $rootScope.user = $scope.user;
      $location.path("chat");
    }
  }]);
