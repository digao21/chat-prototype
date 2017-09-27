require 'sequel'

module ChatSrv
  module Model
    class Chat < Sequel::Model
      many_to_many :users
      #many_to_many :unreaded_users, class: ChatSrv::Model::User, left_key: :chat_id, right_key: :user_id, join_table: :unreaded_chats_users
      one_to_many :messages
    end
  end
end
