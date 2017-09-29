module ChatSrv
  module Utils
    module SocketPoll
      @@map_socket_to_user_id = {}
      @@map_user_id_to_socket = {}

      def self.new_connection socket, user_id
        @@map_socket_to_user_id[ socket.object_id ] = user_id
        @@map_user_id_to_socket[ user_id ] = socket
      end

      def self.close_connection socket
        user_id = @@map_socket_to_user_id[ socket.object_id ]

        @@map_socket_to_user_id.delete socket.object_id
        @@map_user_id_to_socket.delete user_id
      end

      def self.get_socket_from_user_id user_id
        @@map_user_id_to_socket[ user_id ]
      end

      def self.get_user_id_from_socket socket
        @@map_socket_to_user_id[ socket.object_id ]
      end
    end
  end
end
