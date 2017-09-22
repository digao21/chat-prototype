angular
  .module("login", [])
  .controller("Login", ["$rootScope","$scope","$location", "$http", function($rootScope, $scope, $location, $http) {
    $scope.submit = function () {

      $http.get('http://localhost:8080/user/login/' + $scope.user + "/" + $scope.password)
      .then(
      function success (res) {
        $rootScope.user = res.data;
        $location.path('/chat');

        console.log("success");
        console.log("id: %s; username: %s; password %s", res.data.id, res.data.username, res.data.password);
      },
      function error (err) {
        console.log("status", err.status);
        console.log(err.data);
      });

    }
  }]);
