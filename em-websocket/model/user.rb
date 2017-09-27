require 'sequel'

module ChatSrv
  module Model
    class User < Sequel::Model
      many_to_many :chats
      #many_to_many :unreaded_chats, class: ChatSrv::Model::Chat, left_key: :chat_id, right_key: :user_id, join_table: :unreaded_chats_users
      one_to_many :messages
    end
  end
end
