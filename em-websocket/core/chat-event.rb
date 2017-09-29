module ChatSrv
  module Core
    module ChatEvent

      Chat = ChatSrv::Model::Chat
      User = ChatSrv::Model::User

      SocketPoll = ChatSrv::Utils::SocketPoll

      def self.get_chat socket, data
        chat_id = data["chatId"]
        user_id = SocketPoll.get_user_id_from_socket socket

        user = User.where( :id => user_id ).first
        chat = Chat.where( :id => chat_id ).first

        unless chat and user
          #TODO: treat no chat error
        end

        user.remove_unreaded_chat chat

        chat_dto = parse_chat_dto chat

        res = {}
        res["event"] = "GET_CHAT_RES"
        res["chat"] = chat_dto

        socket.send res.to_json
      end

      def self.create_chat socket, data
        chat = Chat.create

        data["users"].each do |username|
          user = User.where( :username => username ).first
          chat.add_user user if user
        end

        if chat.users.length == 0
          #TODO: treat chat without users error
        end

        msg = {}
        msg["event"] = "NEW_CHAT"
        msg["chat"] = parse_chat_dto chat 

        chat.broadcast msg

        msg["event"] = "CREATE_CHAT_RES"
        socket.send msg.to_json
      end

      private
      def self.parse_chat_dto chat
        chat_dto = {}
        chat_dto["id"] = chat.id

        # Parse users
        chat_dto["users"] = []
        chat.users.each do |user|
          user_dto = {}

          user_dto["id"] = user.id
          user_dto["username"] = user.username

          chat_dto["users"].push user_dto
        end

        # Parse messages
        chat_dto["messages"] = []
        chat.messages.each do |message|
          chat_dto["messages"].push parse_message_dto  message
        end

        chat_dto
      end

      def self.parse_message_dto msg
        message_dto = {}

        message_dto["sender"]  = msg.user.username
        message_dto["chatId"]  = msg.chat.id
        message_dto["content"] = msg.content

        return message_dto 
      end
    end
  end
end
