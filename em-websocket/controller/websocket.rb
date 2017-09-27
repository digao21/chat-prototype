module ChatSrv
  module Api
    module Websocket

      SocketPoll = ChatSrv::Utils::SocketPoll
      Message = ChatSrv::Model::Message
      User = ChatSrv::Model::User
      Chat = ChatSrv::Model::Chat

      def self.handle_new_websocket ws
        ws.onopen do
          puts "New User - ws.id" + ws.object_id.to_s
        end

        ws.onmessage do |message|
          begin
            msg = JSON.parse message

            case msg["channel"]
            when "INIT"
              puts "[WS INIT] - user_Id: #{msg["userId"]}"
              SocketPoll.new_connection ws, msg["userId"]

            when "CHAT"
              puts "[WS CHAT] - #{msg["content"]}"

              # SAVE MSG
              message = Message.create :content => msg["content"]

              user = User.where( :id => msg["senderId"] ).first
              user.add_message message

              chat = Chat.where( :id => msg["chatId"] ).first
              chat.add_message message

              # DO BROADCAST
              msg["sender"] = user.username
              chat.users.each do |user|
                socket = SocketPoll.get_socket_from_user_id user.id
                socket.send msg.to_json if socket
              end

            else
              #TODO: HANDLE NO CHANNEL ERROR
              puts "[WS ONMSG] - CHANNEL UNDEFINED"
            end

          rescue JSON::ParserError
            #TODO: HANDLE ERROR
            puts "[WS ONMSG] - PARSER ERROR"
          rescue Exception => e 
            #TODO: HANDLE ERROR
            puts "[WS ONMSG] - #{e.message}"
          end
        end

        ws.onclose do
           puts "WebSocket closed"
           SocketPoll.close_connection ws
        end
      end
    end
  end
end
