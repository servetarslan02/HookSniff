# frozen_string_literal: true

module HookSniff
  class StreamApi
    def initialize(client)
      @client = client
    end

    def list_channels
      @client.request(:get, "/api/v1/stream/channels")
    end

    def get_channel(id)
      @client.request(:get, "/api/v1/stream/channels/#{id}")
    end

    def create_channel(attrs)
      @client.request(:post, "/api/v1/stream/channels", attrs)
    end

    def update_channel(id, attrs)
      @client.request(:put, "/api/v1/stream/channels/#{id}", attrs)
    end

    def delete_channel(id)
      @client.request(:delete, "/api/v1/stream/channels/#{id}")
    end

    def list_messages(id, params = {})
      @client.request(:get, "/api/v1/stream/channels/#{id}/messages", params)
    end

    def list_subscriptions
      @client.request(:get, "/api/v1/stream/subscriptions")
    end

    def disconnect_subscription(id)
      @client.request(:delete, "/api/v1/stream/subscriptions/#{id}")
    end

    def publish(body)
      @client.request(:post, "/api/v1/stream/publish", body)
    end
  end
end
