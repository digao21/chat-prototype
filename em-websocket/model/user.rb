module ChatSrv
  module Model
    class User
      many_to_many :chats
      many_to_many :unreaded_chats, class: ChatSrv::Model::Chat, left_key: :user_id, right_key: :chat_id, join_table: :unreaded_chats_users
      one_to_many :messages
    end
  end
end
