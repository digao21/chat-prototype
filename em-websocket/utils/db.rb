require 'sequel'

DB_CONNECTION = Sequel.connect( adapter: :postgres, user: 'rodrigo', database: 'rodrigo')

require_relative '../model/user'

User   = Chat::Model::User
UserDB = Chat::Model::UserDB

class DB
  def self.get_user filters = {}
    user_db = DB_CONNECTION[:users].where( filters ).first

    return nil if user_db == nil

    DB.parse_user_db user_db
  end

  private
  def self.parse_user_db user_db
    id = user_db[:id]
    username = user_db[:username]
    password = user_db[:password]

    User.new id, username, password
  end
end
