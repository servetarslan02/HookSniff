# frozen_string_literal: true
module HookSniff
  class OperationalWebhook
    def initialize(api_client) = @api_client = api_client
    def list = @api_client.execute(method: :get, path: "/api/v1/operational-webhooks")
    def create(body) = @api_client.execute(method: :post, path: "/api/v1/operational-webhooks", body: body)
    def get(id) = @api_client.execute(method: :get, path: "/api/v1/operational-webhooks/#{id}")
    def update(id, body) = @api_client.execute(method: :put, path: "/api/v1/operational-webhooks/#{id}", body: body)
    def delete(id) = @api_client.execute(method: :delete, path: "/api/v1/operational-webhooks/#{id}")
    def list_deliveries(id) = @api_client.execute(method: :get, path: "/api/v1/operational-webhooks/#{id}/deliveries")
  end
end
