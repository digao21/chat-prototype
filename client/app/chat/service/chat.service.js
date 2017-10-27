(function() {

    'use strict';
    angular.module('Chat').factory('ChatService', ChatService);

    ChatService.$inject = ['ChatBroadcaster','ChatAPI'];

    function ChatService(ChatBroadcaster, ChatAPI) {
        var service = {
            turnOn: turnOn,
            turnOff: turnOff,

            getState: getState,
            getConnectionState: getConnectionState,

            addListener: addListener,
            removeListener: removeListener,

            sendMessage: sendMessage, // Maybe you can remove this
            sendChatMsg: sendChatMsg,

            msgReaded: msgReaded,
            chatReaded: chatReaded,

            getChat: getChat,
            getUser: getUser
        }

        if (service.getState() !== "ON") service.turnOn(); // For test purpose

        return service;

        function turnOn() {
            ChatAPI.turnOn();
        }

        function turnOff() {
            ChatAPI.turnOff();
        }

        function getState() {
            return ChatAPI.getState();
        }

        function getConnectionState() {
            return ChatAPI.getConnectionState();
        }

        function addListener(component, events) {
            ChatBroadcaster.addListener(component, events);
        }

        function removeListener(component) {
            ChatBroadcaster.removeListener(component);
        }

        function sendMessage(msg) {
            ChatAPI.sendMessage( msg );
        }

        function sendChatMsg(chatId, sender, content) {
            var msg = {
                event: 'NEW_MSG',
                chatId: chatId,
                sender: sender,
                content: content
            }

            ChatAPI.sendMessage( msg );
        }

        function getChat(chatId) {
            var msg = {
                event: "GET_CHAT",
                chatId: chatId
            }

            ChatAPI.sendMessage( msg );
        }

        function getUser(userId) {
            var msg = {
                event: "GET_USER",
                userId: userId
            }

            ChatAPI.sendMessage( msg );
        }

        function msgReaded( msgId ) {
            var msg = {
                event: "MSG_READED",
                msgId: msgId
            }

            ChatAPI.sendMessage( msg );
        }

        function chatReaded(chatId, userId) {
            var msg = {
                event: "CHAT_READED",
                chatId: chatId,
                userId: userId
            }

            ChatAPI.sendMessage( msg );
        }
    };
})();
