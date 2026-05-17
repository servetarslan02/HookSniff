# frozen_string_literal: true

module HookSniff
  class HookSniffOptions
    attr_accessor :debug
    attr_accessor :server_url

    def initialize(debug = false, server_url = nil)
      @debug = debug
      @server_url = server_url
    end
  end

  class Client
    attr_accessor :authentication
    attr_accessor :endpoint
    attr_accessor :event_type
    attr_accessor :health
    attr_accessor :message
    attr_accessor :message_attempt
    attr_accessor :statistics
    attr_accessor :environment
    attr_accessor :background_task
    attr_accessor :operational_webhook
    attr_accessor :message_poller
    attr_accessor :inbound
    attr_accessor :connector

    def initialize(auth_token, options = HookSniffOptions.new)
      uri = URI(options.server_url || "https://hooksniff-api-1046140057667.europe-west1.run.app")
      api_client = HookSniffHttpClient.new(auth_token, uri)

      @authentication = Authentication.new(api_client)
      @endpoint = Endpoint.new(api_client)
      @event_type = EventType.new(api_client)
      @health = Health.new(api_client)
      @message = Message.new(api_client)
      @message_attempt = MessageAttempt.new(api_client)
      @statistics = Statistics.new(api_client)
      @environment = Environment.new(api_client)
      @background_task = BackgroundTask.new(api_client)
      @operational_webhook = OperationalWebhook.new(api_client)
      @message_poller = MessagePoller.new(api_client)
      @inbound = Inbound.new(api_client)
      @connector = Connector.new(api_client)
    end
  end
end
