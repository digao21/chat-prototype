module ChatSrv
  module Core
    module UserEvent

      User = ChatSrv::Model::User
      SocketPoll = ChatSrv::Utils::SocketPoll

      def self.init_connection socket, data
        user = User.where( :id => data["userId"] ).first

        unless user
          #TODO: user undefined error
        end

        SocketPoll.new_connection socket, user.id

        user_dto = parse_user_dto user

        res = {}
        res["event"] = "INIT_CONNECTION_RES"
        res["user"] = user_dto

        socket.send res.to_json

        # broadcast each chat from user that he is online
        msg = {}
        msg["event"] = "USER_ONLINE";
        msg["user"] = parse_user_dto_basic_info user

        user.chats.each do |chat| chat.broadcast msg, :except_id => user.id end
      end

      def self.close_connection socket
        user_id = SocketPoll.get_user_id_from_socket socket

        SocketPoll.close_connection socket

        user = User.where( :id => user_id ).first

        #broadcast each user chat he is off
        msg = {}
        msg["event"] = "USER_OFFLINE"
        msg["user"] = parse_user_dto_basic_info user

        user.chats.each do |chat| chat.broadcast msg end
      end

      private
      def self.parse_user_dto user
        user_dto = {}

        user_dto["id"] = user.id
        user_dto["username"] = user.username
        user_dto["password"] = user.password

        user_dto["chats"] = []
        user.chats.each do |chat| user_dto["chats"].push parse_chat_dto chat end

        user_dto["unreadedChats"] = []
        user.unreaded_chats.each do |chat| user_dto["unreadedChats"].push parse_chat_dto chat end

        user_dto["usersOnline"] = []
        user.chats.each do |chat|
          chat.users.each do |c_user| 
            next if c_user.id == user.id

            if SocketPoll.get_socket_from_user_id c_user.id # returns nil if user is off
              user_dto["usersOnline"].push parse_user_dto_basic_info c_user
            end
          end
        end

        user_dto
      end

      def self.parse_user_dto_basic_info user
        user_dto = {}

        user_dto["id"] = user.id
        user_dto["username"] = user.username

        user_dto
      end

      def self.parse_chat_dto chat
        chat_dto = {}
        chat_dto["id"] = chat.id

        # Parse users from chat
        chat_dto["users"] = []
        chat.users.each do |chat_user|
          buff = {}
          buff["id"] = chat_user.id
          buff["username"] = chat_user.username

          chat_dto["users"].push buff
        end

        chat_dto
      end
    end
  end
end
