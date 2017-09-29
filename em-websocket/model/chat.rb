module ChatSrv
  module Model
    class Chat
      many_to_many :users
      many_to_many :unreaded_users, class: ChatSrv::Model::User, left_key: :chat_id, right_key: :user_id, join_table: :unreaded_chats_users
      one_to_many :messages

      SocketPoll = ChatSrv::Utils::SocketPoll

      def broadcast msg, opt={}
        users.each do |user|
          next if opt[:except_id] == user.id
          socket = SocketPoll.get_socket_from_user_id user.id
          socket.send msg.to_json if socket
        end
      end
    end
  end
end
