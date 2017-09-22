require 'em-websocket'
require 'json'

module Chat
  module Api
    module Websocket
      def self.handle_new_websocket ws
        ws.onopen do
          puts "New User - ws.id" + ws.object_id.to_s
          ws.send "Hello Client!" 
        end

        ws.onmessage do |message|
          msg = nil

          begin
            msg = JSON.parse message
          rescue ParseError
            #TODO: HANDLE ERROR
            return
          end

          case msg["channel"]
          when "CHAT"
            puts "[CHAT] - #{msg["content"]}"
            ws.send "Pong: #{message}"
          else
            #TODO: HANDLE NO CHANNEL ERROR
          end
        end

        ws.onclose do
           puts "WebSocket closed"
        end
      end
    end
  end
end
