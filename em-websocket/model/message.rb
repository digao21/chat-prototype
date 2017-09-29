module ChatSrv
  module Model
    class Message
      many_to_one :chat
      many_to_one :user
    end
  end
end
