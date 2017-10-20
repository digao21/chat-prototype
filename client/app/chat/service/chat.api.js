(function() {

    'use strict';
    angular.module('Chat').factory('ChatAPI', ChatAPI);

    ChatAPI.$inject = ['ChatWSocket', 'ChatBroadcaster'];

    const ON  = "ON";
    const OFF = "OFF";

    var connection;
    var state = OFF;

    function ChatAPI(ChatWSocket, ChatBroadcaster) {
        var api = {
            turnOn: turnOn,
            turnOff: turnOff,

            getState: getState,
            getConnectionState: getConnectionState,
            sendMessage: sendMessage
        }

        return api;

        function turnOn() {
            if (state === ON) return;

            state = ON;
            connect();
        }

        function connect() {
            connection = ChatWSocket.makeConnection("ws://chat-hmg.kuadro.com.br:8081");
           
            connection.onOpen = onOpen;
            connection.onMessage = onMessage;
            connection.onClose = onClose;
            connection.onError = onError;
        }

        function turnOff() {
            if (state === OFF) return;

            state = OFF;

            connection.close();
        }

        function getState() {
            return state;
        }

        function getConnectionState() {
            if (state === OFF) return "CLOSED";

            return connection.getState();
        }

        function sendMessage(msg) {
            if (getConnectionState() === "OPEN") connection.sendMessage( msg );
        }

        function onOpen(msg) {
            console.log("[WEBSOCKET ON_OPEN]");

            msg.event = "OPEN_CONNECTION";
            ChatBroadcaster.broadcast( msg );
        }

        function onMessage(msg) {
            console.log("[WEBSOCKET ON_MESSAGE] - %s", msg.event);
            ChatBroadcaster.broadcast( msg );
        }

        function onClose() {
            console.log("[WEBSOCKET ON_CLOSE]");
            ChatBroadcaster.broadcast( {event: "CONNECTION_CLOSED"} );

            if (state === ON) {
                reconnect();
            }
        }

        function reconnect() {
            var time = 1000 + Math.random()*1000;
            setTimeout(connect, time);
        }

        // Connection error!! 
        function onError( msg ) {
            //TODO: treat the error

            if (state === ON) {
                var connectionState = getConnectionState();

                if (connectionState === "CLOSED" || connectionState === "CLOSING")
                    reconnect();
            }
        }
    };
})();
