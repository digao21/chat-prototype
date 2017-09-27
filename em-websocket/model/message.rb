require 'sequel'

module ChatSrv
  module Model
    class Message < Sequel::Model
      many_to_one :chat
      many_to_one :user
    end
  end
end
