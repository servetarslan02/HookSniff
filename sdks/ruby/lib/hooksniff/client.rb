# frozen_string_literal: true

require 'net/http'
require 'json'
require 'uri'
require 'openssl'

module HookSniff
  class Client
    DEFAULT_BASE_URL = 'https://hooksniff-api-1046140057667.europe-west1.run.app'
    DEFAULT_TIMEOUT = 30
    DEFAULT_RETRIES = 2
    USER_AGENT = 'hooksniff-ruby/0.4.0'

    attr_reader :endpoints, :webhooks, :auth, :analytics, :api_keys, :alerts, :teams, :search, :billing, :health

    def initialize(api_key:, base_url: nil, timeout: nil, num_retries: nil)
      raise ArgumentError, 'apiKey is required' if api_key.nil? || api_key.empty?

      @api_key = api_key
      @base_url = (base_url || DEFAULT_BASE_URL).chomp('/')
      @timeout = timeout || DEFAULT_TIMEOUT
      @num_retries = num_retries || DEFAULT_RETRIES

      @endpoints = Resources::Endpoints.new(self)
      @webhooks = Resources::Webhooks.new(self)
      @auth = Resources::Auth.new(self)
      @analytics = Resources::Analytics.new(self)
      @api_keys = Resources::ApiKeys.new(self)
      @alerts = Resources::Alerts.new(self)
      @teams = Resources::Teams.new(self)
      @search = Resources::Search.new(self)
      @billing = Resources::Billing.new(self)
      @health = Resources::Health.new(self)
    end

    def get(path)
      request(:get, path)
    end

    def post(path, body = nil)
      request(:post, path, body)
    end

    def put(path, body = nil)
      request(:put, path, body)
    end

    def delete(path)
      request(:delete, path)
    end

    private

    def request(method, path, body = nil)
      last_error = nil

      (0..@num_retries).each do |attempt|
        uri = URI.parse("#{@base_url}#{path}")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = uri.scheme == 'https'
        http.open_timeout = @timeout
        http.read_timeout = @timeout

        case method
        when :get
          req = Net::HTTP::Get.new(uri.request_uri)
        when :post
          req = Net::HTTP::Post.new(uri.request_uri)
          req.body = body.to_json if body
        when :put
          req = Net::HTTP::Put.new(uri.request_uri)
          req.body = body.to_json if body
        when :delete
          req = Net::HTTP::Delete.new(uri.request_uri)
        end

        req['Authorization'] = "Bearer #{@api_key}"
        req['User-Agent'] = USER_AGENT
        req['Accept'] = 'application/json'
        req['Content-Type'] = 'application/json' if body

        begin
          response = http.request(req)

          if response.code.to_i >= 500 && attempt < @num_retries
            last_error = APIError.new(response.code.to_i, response.body)
            sleep(0.05 * (2**attempt))
            next
          end

          raise APIError.new(response.code.to_i, response.body) if response.code.to_i >= 400

          return JSON.parse(response.body) if response.body && !response.body.empty?
          return nil
        rescue StandardError => e
          last_error = e
          raise if e.is_a?(APIError) && e.code < 500
          raise if attempt >= @num_retries

          sleep(0.05 * (2**attempt))
        end
      end

      raise last_error
    end
  end

  class APIError < StandardError
    attr_reader :code, :body

    def initialize(code, body)
      @code = code
      @body = body
      super("HookSniff API Error #{code}: #{body}")
    end
  end
end
