# frozen_string_literal: true

module HookSniff
  class Connector
    def initialize(client)
      @client = client
    end

    def list
      @client.request(:get, "/api/v1/connectors")
    end

    def get(id)
      @client.request(:get, "/api/v1/connectors/#{id}")
    end

    def list_configs
      @client.request(:get, "/api/v1/connectors/configs")
    end

    def create_config(body)
      @client.request(:post, "/api/v1/connectors/configs", body: body)
    end

    def update_config(id, body)
      @client.request(:put, "/api/v1/connectors/configs/#{id}", body: body)
    end

    def delete_config(id)
      @client.request(:delete, "/api/v1/connectors/configs/#{id}")
    end
  end
end
