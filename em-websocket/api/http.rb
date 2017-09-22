require 'sinatra/base'

require_relative '../utils/db'

module Chat
  module Api
    class Http < Sinatra::Base

      # Returns user based on combination username/password
      get '/user/login/:username/:password' do
        username = params[:username]
        password = params[:password]

        puts "[GET /user/login/:username/:password] - username: #{username}; password: #{password}" 

        user = DB.get_user :username => username, :password => password

        halt 400, "Ilegal user/password combination" if user == nil

        user.to_json
      end

      # Create and return a new chat with the requested user as member
      post 'chat/:userId' do
        user_id = params[:userId]

        user = DB.get_user :id => user_id
        halt 400, "User id not found in DB" if user == nil

        DB.create_chat user_id
      end
    end
  end
end
