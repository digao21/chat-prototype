require 'sequel'
require 'json'

module Chat
  module Model
    class User 
      def to_json
        hash = {}
        hash["id"] = @id
        hash["username"] = @username
        hash["password"] = @password
        hash.to_json
      end
    end

    class UserDB < Sequel::Model(:users)
    end
  end
end
