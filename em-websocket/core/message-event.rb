module ChatSrv
  module Core
    module MessageEvent

      Chat = ChatSrv::Model::Chat
      User = ChatSrv::Model::User
      Message = ChatSrv::Model::Message

      def self.new_msg socket, data
        chat = Chat.where( :id => data["chatId"] ).first
        user = User.where( :id => data["sender"] ).first

        unless chat and user
          #TODO: treat chat or user undefined
        end

        msg = Message.create( :content => data["content"] )
        chat.add_message msg
        user.add_message msg

        # Set chat as unreaded for all users on chat
        chat.users.each do |user|
          user.add_unreaded_chat chat unless user.unreaded_chats.include? chat
        end

        bdc_msg = {}
        bdc_msg["event"]   = "NEW_MSG_C"
        bdc_msg["message"] = parse_message_dto msg

        chat.broadcast bdc_msg
      end

      def self.new_msg_ack socket, data
        user = User.where( :id => data["userId"] ).first
        chat = Chat.where( :id => data["chatId"] ).first

        unless user and chat
          #TODO: treat user/chat undefined
        end

        user.remove_unreaded_chat chat
      end

      private
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
