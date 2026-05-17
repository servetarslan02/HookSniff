# frozen_string_literal: true

require "net/http"

module HookSniff
  class Message
    def initialize(client)
      @client = client
    end

    def create(message_in, options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "POST",
        "/v1/webhooks",
        headers: {
          "idempotency-key" => options["idempotency-key"]
        },
        body: message_in
      )
      MessageOut.deserialize(res)
    end

    def list(options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "GET",
        "/v1/webhooks",
        query_params: {
          "limit" => options["limit"],
          "offset" => options["offset"],
          "status" => options["status"]
        }
      )
      ListResponseMessageOut.deserialize(res)
    end

    def get(message_id)
      res = @client.execute_request("GET", "/v1/webhooks/#{message_id}")
      MessageOut.deserialize(res)
    end

    def replay(message_id)
      res = @client.execute_request("POST", "/v1/webhooks/#{message_id}/replay")
      ReplayOut.deserialize(res)
    end
  end
end
