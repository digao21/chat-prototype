require 'sinatra/base'

require_relative '../model/user'
require_relative '../model/chat'
require_relative '../model/message'

module ChatSrv
  module Api
    class Http < Sinatra::Base

      User = ChatSrv::Model::User
      Chat = ChatSrv::Model::Chat

      # Returns user based on combination username/password
      get '/user/login/:username/:password' do
        username = params[:username]
        password = params[:password]

        puts "[GET /user/login/:username/:password] - username: #{username}; password: #{password}" 

        user = User.where( :username => username, :password => password ).first

        halt 400, "Ilegal user/password combination" if user == nil

        parse_user_dto user
      end

      # Get user based on username
      get '/user/username/:username' do
        username = params[:username]

        puts "[GET /user/username/:username/] - username: #{username}" 

        user = User.where( :username => username ).first

        halt 400, "Ilegal user/password combination" if user == nil

        parse_user_dto user
      end

      # Returns the chat
      get '/chat/:chatId' do
        chat_id = params[:chatId]

        puts "[GET /chat/:chatId] - chatId: #{chat_id}"

        chat = Chat.where( :id => chat_id ).first

        halt 400, "Chat not found in DB" if chat == nil

        parse_chat_dto chat
      end

      # Create and return a new chat with the requested user as member
      post '/chat/create' do
        body_params = JSON.parse request.body.read
        users_id = body_params["users"]

        puts "[POST /chat/create] - users: #{users_id.to_s}"

        chat = Chat.create

        users_id.each do |user_id|
          user = User.where( :id => user_id ).first
          halt 400, "User id not found in DB" if user == nil

          chat.add_user user
        end

        parse_chat_dto chat
      end

      # Add user to chat is not a member
      put '/chat/:chatId/add/:userId' do
        chat_id = params[:chatId]
        user_id = params[:userId]

        puts "[PUT /chat/:chatId/add/:userId] - chatId: #{chat_id}; userId: #{user_id}"

        chat = Chat.where( :id => chat_id ).first
        halt 400, "Chat id not found in DB" if chat == nil

        user = User.where( :id => user_id ).first
        halt 400, "User id not found in DB" if user == nil

        chat.add_user user unless chat.users.include? user
        "OK"
      end

      def parse_user_dto user
        user_dto = {}

        user_dto["id"] = user.id
        user_dto["username"] = user.username
        user_dto["password"] = user.password

        # Parse chats
        user_dto["chats"] = []
        user.chats.each do |chat|
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

          user_dto["chats"].push chat_dto
        end

        # Parse unreaded chats
        user_dto["unreadedChats"] = []
        user.unreaded_chats.each do |chat|
          chat_dto = {}
          chat_dto["id"] = chat.id
        end

        user_dto.to_json
      end

      def parse_chat_dto chat
        chat_dto = {}
        chat_dto["id"] = chat.id

        # Parse users
        chat_dto["users"] = []
        chat.users.each do |user|
          user_dto = {}

          user_dto["id"] = user.id
          user_dto["username"] = user.username

          chat_dto["users"].push user_dto
        end

        # Parse messages
        chat_dto["messages"] = []
        chat.messages.each do |message|
          message_dto = {}

          message_dto["sender"]  = message.user.username
          message_dto["content"] = message.content

          chat_dto["messages"].push message_dto
        end

        chat_dto.to_json
      end
    end
  end
end
