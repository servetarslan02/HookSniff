# frozen_string_literal: true

module HookSniff
  class IntegrationApi
    def initialize(client)
      @client = client
    end

    def list
      @client.request(:get, "/api/v1/integrations")
    end

    def get(id)
      @client.request(:get, "/api/v1/integrations/#{id}")
    end

    create_attrs = %i[name description connector_config_id endpoint_id event_filter transform_id retry_policy metadata enabled]
    def create(attrs)
      @client.request(:post, "/api/v1/integrations", attrs)
    end

    def update(id, attrs)
      @client.request(:put, "/api/v1/integrations/#{id}", attrs)
    end

    def delete(id)
      @client.request(:delete, "/api/v1/integrations/#{id}")
    end

    def test(id)
      @client.request(:post, "/api/v1/integrations/#{id}/test")
    end

    def list_events(id, params = {})
      @client.request(:get, "/api/v1/integrations/#{id}/events", params)
    end

    def get_stats(id)
      @client.request(:get, "/api/v1/integrations/#{id}/stats")
    end
  end
end
