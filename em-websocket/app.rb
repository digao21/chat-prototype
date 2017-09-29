require 'sinatra/base'
require 'eventmachine'
require 'em-websocket'
require 'sequel'
require 'thin'
require 'json'

DB_CONNECTION = Sequel.connect( adapter: :postgres, user: 'rodrigo', database: 'rodrigo')

# Dependencies first

require './utils/socket-poll'
require './model/include'

Dir["./model/*.rb"].each {|file| require file }
Dir["./core/*.rb"].each {|file| require file }
Dir["./controller/*.rb"].each {|file| require file }

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
