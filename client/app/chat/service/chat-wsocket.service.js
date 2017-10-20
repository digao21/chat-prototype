(function() {
    'use strict';
    angular.module('Chat').factory('ChatWSocket', ChatWSocket);

    ChatWSocket.$inject = ['$rootScope'];

    function ChatWSocket($rootScope) {
        const service = {
            makeConnection: makeConnection
        } 

        return service;

        function makeConnection(url) {
            var connection = {
                hasInit: false,
                getState: getState,
                sendMessage: sendMessage,
                close: close
            };

            const wsocket = new WebSocket(url);

            wsocket.onopen = onOpen;
            wsocket.onmessage = onMessage;
            wsocket.onclose = onClose;

            connection.wsocket = wsocket;
            return connection;

            function getState() {
                switch (connection.wsocket.readyState) {
                    case WebSocket.CONNECTING: return "CONNECTING";
                    case WebSocket.OPEN:
                        if (connection.hasInit) return "OPEN";
                        else return "CONNECTING";
                    case WebSocket.CLOSING:    return "CLOSING";
                    case WebSocket.CLOSED:     return "CLOSED";

                    //TODO: proper log this error
                    default: console.log("[ERROR] - unpredicted websocket error");
                }
            }

            function sendMessage(msg) {
                connection.wsocket.send( JSON.stringify(msg) );
            }

            function close() {
                connection.wsocket.close();
            }

            function onOpen() {
                var user = $rootScope.user;

                if (user === undefined) {
                    var err = {
                        event: "USER_UNDEFINED",
                        msg: "Attempt to connect chat with undefined user"
                    }

                    connect.onError(err);
                    connect.close();
                }

                // Initialize protocol
                var initMsg = {
                    event: "INIT_CONNECTION",
                    userId: user.id,
                    token: user.token,
                    name: user.name
                }

                connection.wsocket.send( JSON.stringify(initMsg) );
            }

            function onMessage(evt) {
                var msg = JSON.parse( evt.data );

                if (connection.hasInit) { 
                    connection.onMessage(msg);
                    return;
                }

                // init callback
                if (msg.event === "INIT_CONNECTION_RES") {
                    connection.hasInit = true;
                    connection.onOpen(msg);
                }
            }

            function onClose() {
                connection.hasInit = false;
                connection.onClose();
            }
        }
    };
})();

