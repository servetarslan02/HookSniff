# frozen_string_literal: true

require "net/http"

module HookSniff
  class MessageAttempt
    def initialize(client)
      @client = client
    end

    def list_by_msg(message_id, options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "GET",
        "/v1/webhooks/#{message_id}/attempts",
        query_params: {
          "limit" => options["limit"],
          "offset" => options["offset"],
          "status" => options["status"]
        }
      )
      ListResponseMessageAttemptOut.deserialize(res)
    end

    def get(attempt_id)
      res = @client.execute_request("GET", "/v1/webhooks/attempts/#{attempt_id}")
      MessageAttemptOut.deserialize(res)
    end

    def resend(message_id, endpoint_id)
      res = @client.execute_request(
        "POST",
        "/v1/webhooks/#{message_id}/attempts/#{endpoint_id}/resend"
      )
      nil
    end
  end
end
