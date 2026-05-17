# frozen_string_literal: true

module HookSniff
  class Inbound
    def initialize(client)
      @client = client
    end

    def list_configs
      @client.request(:get, "/api/v1/inbound/configs")
    end

    def create_config(body)
      @client.request(:post, "/api/v1/inbound/configs", body: body)
    end

    def update_config(id, body)
      @client.request(:put, "/api/v1/inbound/configs/#{id}", body: body)
    end

    def delete_config(id)
      @client.request(:delete, "/api/v1/inbound/configs/#{id}")
    end
  end
end
