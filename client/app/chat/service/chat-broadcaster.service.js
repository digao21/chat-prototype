(function() {

    'use strict';
    angular.module('Chat').factory('ChatBroadcaster', ChatBroadcaster);

    ChatBroadcaster.$inject = [];

    var listeners = [];

    function ChatBroadcaster() {
        var service = {
            addListener: addListener,
            removeListener: removeListener,

            broadcast: broadcast,
        }

        return service;

        function addListener(component, events) {
            listeners.push( makeListener(component, events) );
        }

        function removeListener(component) {
            var i = 0;
            for(; i < listeners.length; i++) {
                if(listeners[i].component === component) break;
            }

            if (i < listeners.length) listeners.splice(i, 1); // remove element
        }

        function broadcast(msg) {
            listeners.forEach(function(listener) {
                listener.newMessage( msg );
            });
        }
    };

    function makeListener(component, events) {
        var listener = {
            component: component,
            newMessage: messageFilter
        }

        function messageFilter(msg) {
            if (events.includes( msg.event ))
                component[msg.event](msg);
        }

        return listener;
    }
})();
