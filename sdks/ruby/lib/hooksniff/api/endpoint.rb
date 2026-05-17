# frozen_string_literal: true

require "net/http"

module HookSniff
  class Endpoint
    def initialize(client)
      @client = client
    end

    def list(options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "GET",
        "/v1/endpoints",
        query_params: {
          "limit" => options["limit"],
          "offset" => options["offset"]
        }
      )
      ListResponseEndpointOut.deserialize(res)
    end

    def create(endpoint_in, options = {})
      options = options.transform_keys(&:to_s)
      res = @client.execute_request(
        "POST",
        "/v1/endpoints",
        headers: {
          "idempotency-key" => options["idempotency-key"]
        },
        body: endpoint_in
      )
      EndpointOut.deserialize(res)
    end

    def get(endpoint_id)
      res = @client.execute_request("GET", "/v1/endpoints/#{endpoint_id}")
      EndpointOut.deserialize(res)
    end

    def update(endpoint_id, endpoint_update)
      res = @client.execute_request(
        "PUT",
        "/v1/endpoints/#{endpoint_id}",
        body: endpoint_update
      )
      EndpointOut.deserialize(res)
    end

    def patch(endpoint_id, endpoint_patch)
      res = @client.execute_request(
        "PATCH",
        "/v1/endpoints/#{endpoint_id}",
        body: endpoint_patch
      )
      EndpointOut.deserialize(res)
    end

    def delete(endpoint_id)
      @client.execute_request("DELETE", "/v1/endpoints/#{endpoint_id}")
      nil
    end

    def rotate_secret(endpoint_id, endpoint_secret_rotate_in)
      res = @client.execute_request(
        "POST",
        "/v1/endpoints/#{endpoint_id}/rotate-secret",
        body: endpoint_secret_rotate_in
      )
      EndpointSecretOut.deserialize(res)
    end

    def get_headers(endpoint_id)
      res = @client.execute_request("GET", "/v1/endpoints/#{endpoint_id}/headers")
      EndpointHeadersOut.deserialize(res)
    end

    def update_headers(endpoint_id, endpoint_headers_in)
      @client.execute_request(
        "PUT",
        "/v1/endpoints/#{endpoint_id}/headers",
        body: endpoint_headers_in
      )
      nil
    end

    def patch_headers(endpoint_id, endpoint_headers_patch_in)
      @client.execute_request(
        "PATCH",
        "/v1/endpoints/#{endpoint_id}/headers",
        body: endpoint_headers_patch_in
      )
      nil
    end

    def get_secret(endpoint_id)
      res = @client.execute_request("GET", "/v1/endpoints/#{endpoint_id}/secret")
      EndpointSecretOut.deserialize(res)
    end
  end
end
