require 'eventmachine'
require 'em-websocket'
require 'thin'

require_relative './api/http'
require_relative './api/websocket'

EventMachine.run do

  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8081) do |ws|
    Chat::Api::Websocket.handle_new_websocket ws
  end

  Rack::Server.start(
    :app     => Chat::Api::Http.new,
    :server  => 'thin',
    :Host    => '0.0.0.0',
    :Port    => '8080',
    :signals => false
  )
end
