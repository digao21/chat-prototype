module ChatSrv
  module Api
    module Websocket

      Core = ChatSrv::Core

      def self.handle_new_websocket ws
        ws.onopen do
          puts "[WS ON_OPEN] - ws.id: #{ws.object_id.to_s}"
        end

        ws.onmessage do |message|
          begin
            msg = JSON.parse message

            case msg["event"]
            when "INIT_CONNECTION"
              puts "[INIT_CONNECTION] - user_Id: #{msg["userId"]}"
              Core::UserEvent.init_connection ws, msg

            when "GET_CHAT"
              puts "[GET_CHAT] - chat_id: #{msg["chatId"]}"
              Core::ChatEvent.get_chat ws, msg

            when "CREATE_CHAT"
              puts "[CREATE_CHAT]"
              Core::ChatEvent.create_chat ws, msg

            when "NEW_MSG_S"
              puts "[NEW_MSG_S]"
              Core::MessageEvent.new_msg ws, msg

            when "NEW_MSG_C_ACK"
              puts "[NEW_MSG_C_ACK]"
              Core::MessageEvent.new_msg_ack ws, msg

            else
              #TODO: HANDLE NO CHANNEL ERROR
              puts "[WS ON_MESSAGE] - CHANNEL UNDEFINED"
            end

          rescue JSON::ParserError
            #TODO: HANDLE ERROR
            puts "[WS ON_MESSAGE] - PARSER ERROR"
          rescue Exception => e 
            #TODO: HANDLE ERROR
            puts "[WS ON_MESSAGE] - #{e.message}"
          end
        end

        ws.onclose do
          begin
            puts "WebSocket closed"
            Core::UserEvent.close_connection ws
          rescue
            puts "[WS ON_CLOSE] - ERROR"
          end
        end
      end
    end
  end
end
