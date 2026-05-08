# frozen_string_literal: true

require_relative "models"

module HookSniff
  class Client
    attr_reader :endpoints, :webhooks

    def initialize(api_key:, base_url: nil, timeout: nil)
      @api_key = api_key
      @base_url = (base_url || DEFAULT_BASE_URL).chomp("/")
      @timeout = timeout || DEFAULT_TIMEOUT
      @endpoints = EndpointsResource.new(self)
      @webhooks = WebhooksResource.new(self)
    end

    # Get platform statistics
    def stats
      resp = request(:get, "/stats")
      Models::Stats.new(resp)
    end

    # @api internal
    def request(method, path, body: nil)
      uri = URI("#{@base_url}#{path}")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == "https")
      http.open_timeout = @timeout
      http.read_timeout = @timeout

      case method
      when :get
        req = Net::HTTP::Get.new(uri)
      when :post
        req = Net::HTTP::Post.new(uri)
      when :delete
        req = Net::HTTP::Delete.new(uri)
      else
        raise ArgumentError, "Unsupported HTTP method: #{method}"
      end

      req["Authorization"] = "Bearer #{@api_key}"
      req["Content-Type"] = "application/json"
      req["User-Agent"] = "hooksniff-ruby/#{VERSION}"

      req.body = JSON.generate(body) if body

      response = http.request(req)

      case response.code.to_i
      when 200..299
        content_type = response["content-type"] || ""
        if content_type.include?("text/csv")
          response.body
        else
          JSON.parse(response.body) rescue response.body
        end
      when 400
        raise ValidationError, parse_error_message(response)
      when 401
        raise AuthenticationError, parse_error_message(response)
      when 404
        raise NotFoundError, parse_error_message(response)
      when 413
        raise PayloadTooLargeError, parse_error_message(response)
      when 429
        raise RateLimitError, parse_error_message(response)
      else
        raise Error, "HTTP #{response.code}: #{parse_error_message(response)}"
      end
    end

    private

    def parse_error_message(response)
      body = JSON.parse(response.body)
      body.dig("error", "message") || "HTTP #{response.code}"
    rescue
      "HTTP #{response.code}"
    end
  end

  class EndpointsResource
    def initialize(client)
      @client = client
    end

    def create(url:, description: nil, retry_policy: nil)
      body = { url: url }
      body[:description] = description if description
      if retry_policy
        body[:retry_policy] = {
          max_attempts: retry_policy[:max_attempts],
          backoff: retry_policy[:backoff],
          initial_delay_secs: retry_policy[:initial_delay_secs],
          max_delay_secs: retry_policy[:max_delay_secs]
        }.compact
      end

      resp = @client.request(:post, "/endpoints", body: body)
      Models::Endpoint.new(resp)
    end

    def get(endpoint_id)
      resp = @client.request(:get, "/endpoints/#{endpoint_id}")
      Models::Endpoint.new(resp)
    end

    def list(page: 1, per_page: 20)
      params = { page: page.to_s, per_page: per_page.to_s }
      query = URI.encode_www_form(params)
      resp = @client.request(:get, "/endpoints?#{query}")
      {
        endpoints: (resp["endpoints"] || resp).map { |ep| Models::Endpoint.new(ep) },
        total: resp["total"] || 0,
        page: resp["page"] || page,
        per_page: resp["per_page"] || per_page
      }
    end

    def delete(endpoint_id)
      resp = @client.request(:delete, "/endpoints/#{endpoint_id}")
      resp["deleted"] != false
    end

    def rotate_secret(endpoint_id)
      @client.request(:post, "/endpoints/#{endpoint_id}/rotate-secret")
    end

    private
  end

  class WebhooksResource
    def initialize(client)
      @client = client
    end

    # Send a webhook
    def send(endpoint_id:, event: nil, data:)
      body = { endpoint_id: endpoint_id, data: data }
      body[:event] = event if event
      resp = @client.request(:post, "/webhooks", body: body)
      Models::Delivery.new(resp)
    end

    # Get a delivery by ID
    def get(delivery_id)
      resp = @client.request(:get, "/webhooks/#{delivery_id}")
      Models::Delivery.new(resp)
    end

    # List deliveries with optional filters
    def list(status: nil, page: 1, per_page: 20)
      params = { page: page.to_s, per_page: per_page.to_s }
      params[:status] = status if status
      query = URI.encode_www_form(params)
      resp = @client.request(:get, "/webhooks?#{query}")
      Models::DeliveryList.new(resp)
    end

    # Replay a delivery
    def replay(delivery_id)
      resp = @client.request(:post, "/webhooks/#{delivery_id}/replay")
      Models::Delivery.new(resp)
    end

    # Send multiple webhooks in a batch
    def batch(webhooks)
      body = {
        webhooks: webhooks.map do |w|
          item = { endpoint_id: w[:endpoint_id], data: w[:data] }
          item[:event] = w[:event] if w[:event]
          item
        end
      }
      resp = @client.request(:post, "/webhooks/batch", body: body)
      Models::BatchResult.new(resp)
    end

    # Get delivery attempts
    def attempts(delivery_id)
      resp = @client.request(:get, "/webhooks/#{delivery_id}/attempts")
      resp.map { |a| Models::DeliveryAttempt.new(a) }
    end

    # Export deliveries
    def export(format: nil, status: nil, date_from: nil, date_to: nil)
      params = {}
      params[:format] = format if format
      params[:status] = status if status
      params[:date_from] = date_from if date_from
      params[:date_to] = date_to if date_to
      query = URI.encode_www_form(params)
      query = "?#{query}" unless query.empty?

      resp = @client.request(:get, "/webhooks/export#{query}")
      return resp if format == "csv"

      resp.map { |d| Models::Delivery.new(d) }
    end

    # Search deliveries with filters
    def search(query: nil, event: nil, status: nil, endpoint_id: nil, page: 1, per_page: 20)
      params = { page: page.to_s, per_page: per_page.to_s }
      params[:q] = query if query
      params[:event] = event if event
      params[:status] = status if status
      params[:endpoint_id] = endpoint_id if endpoint_id
      query_str = URI.encode_www_form(params)
      @client.request(:get, "/search?#{query_str}")
    end
  end
end
