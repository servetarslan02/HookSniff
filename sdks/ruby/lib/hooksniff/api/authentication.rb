# frozen_string_literal: true

require "net/http"

module HookSniff
  class Authentication
    def initialize(client)
      @client = client
    end

    def app_portal_access(app_id, app_portal_access_in, options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "POST",
        "/v1/auth/portal-access/#{app_id}",
        headers: {
          "idempotency-key" => options["idempotency-key"]
        },
        body: app_portal_access_in
      )
      DashboardAccessOut.deserialize(res)
    end

    def logout(options = {})
      options = options.transform_keys(&:to_s)
      @client.execute_request(
        "POST",
        "/v1/auth/logout",
        headers: {
          "idempotency-key" => options["idempotency-key"]
        }
      )
      nil
    end
  end
end
