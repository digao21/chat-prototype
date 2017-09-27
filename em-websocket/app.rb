require 'eventmachine'
require 'em-websocket'
require 'sequel'
require 'thin'
require 'json'

DB_CONNECTION = Sequel.connect( adapter: :postgres, user: 'rodrigo', database: 'rodrigo')

require_relative './model/chat'
require_relative './model/user'
require_relative './model/message'

require_relative './utils/socket-poll'

require_relative './controller/http'
require_relative './controller/websocket'

EventMachine.run do


  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8081) do |ws|
    ChatSrv::Api::Websocket.handle_new_websocket ws
  end

  Rack::Server.start(
    :app     => ChatSrv::Api::Http.new,
    :server  => 'thin',
    :Host    => '0.0.0.0',
    :Port    => '8080',
    :signals => false
  )
end
