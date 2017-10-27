angular
  .module("login", [])
  .controller("Login", ["$rootScope","$scope","$location", "$http", "ChatAPI", "Const", function($rootScope, $scope, $location, $http, ChatAPI, Const) {
    $scope.submit = function () {

      var payload = { email: $scope.email, password: $scope.password };
      var url = Const.backendUrl + '/internal/auth';

      $http.post(url, payload)
      .then(
      function success (res) {
        $rootScope.user = res.data.user_details;
        ChatAPI.turnOn();
        $location.path('/chat');

        console.log("success");
        console.log(res.data);
      },
      function error (err) {
        console.log("status", err.status);
        console.log(err.data);
      });

    }
  }]);
