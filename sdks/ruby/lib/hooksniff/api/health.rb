# frozen_string_literal: true

require "net/http"

module HookSniff
  class Health
    def initialize(client)
      @client = client
    end

    def get
      res = @client.execute_request("GET", "/v1/health")
      res
    end
  end
end
