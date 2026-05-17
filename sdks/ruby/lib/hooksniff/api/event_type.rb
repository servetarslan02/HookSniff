# frozen_string_literal: true

require "net/http"

module HookSniff
  class EventType
    def initialize(client)
      @client = client
    end

    def list(options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "GET",
        "/v1/event-types",
        query_params: {
          "limit" => options["limit"],
          "offset" => options["offset"],
          "include_archived" => options["include_archived"]
        }
      )
      ListResponseEventTypeOut.deserialize(res)
    end

    def create(event_type_in, options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "POST",
        "/v1/event-types",
        headers: {
          "idempotency-key" => options["idempotency-key"]
        },
        body: event_type_in
      )
      EventTypeOut.deserialize(res)
    end

    def get(event_type_name)
      res = @client.execute_request("GET", "/v1/event-types/#{event_type_name}")
      EventTypeOut.deserialize(res)
    end

    def update(event_type_name, event_type_update)
      res = @client.execute_request(
        "PUT",
        "/v1/event-types/#{event_type_name}",
        body: event_type_update
      )
      EventTypeOut.deserialize(res)
    end

    def patch(event_type_name, event_type_patch)
      res = @client.execute_request(
        "PATCH",
        "/v1/event-types/#{event_type_name}",
        body: event_type_patch
      )
      EventTypeOut.deserialize(res)
    end

    def delete(event_type_name)
      @client.execute_request("DELETE", "/v1/event-types/#{event_type_name}")
      nil
    end
  end
end
