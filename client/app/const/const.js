(function(){
  angular
    .module("Const", [])
    .factory("Const", Const);

    function Const() {
      var localhost = {
        wsUrl: "ws://localhost:8081",
        backendUrl: "http://localhost:9292/api"
      }

      var development = {
        wsUrl: "ws://chat-hmg.kuadro.com.br:8081",
        backendUrl: "https://api-dev1.kuadro.com.br/api"
      }

//      return localhost;
      return development;
    }
})();
