# frozen_string_literal: true

require "net/http"

module HookSniff
  class Statistics
    def initialize(client)
      @client = client
    end

    def aggregate_event_types(options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "GET",
        "/v1/stats/event-types",
        query_params: {
          "since" => options["since"],
          "until" => options["until"]
        }
      )
      AggregateEventTypesOut.deserialize(res)
    end

    def app_stats(app_id, options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "GET",
        "/v1/stats/app/#{app_id}",
        query_params: {
          "since" => options["since"],
          "until" => options["until"]
        }
      )
      res
    end
  end
end
