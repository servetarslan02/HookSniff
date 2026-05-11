# frozen_string_literal: true

module HookSniff
  module Resources
    class Endpoints
      def initialize(client)
        @client = client
      end

      def list(limit: nil, offset: nil)
        path = '/v1/endpoints'
        params = []
        params << "limit=#{limit}" if limit
        params << "offset=#{offset}" if offset
        path += "?#{params.join('&')}" unless params.empty?
        @client.get(path)
      end

      def list_all(limit: 50)
        HookSniff::Pagination.collect_all(limit: limit) do |l, o|
          list(limit: l, offset: o)
        end
      end

      def create(input)
        @client.post('/v1/endpoints', input)
      end

      def get(id)
        @client.get("/v1/endpoints/#{id}")
      end

      def update(id, input)
        @client.put("/v1/endpoints/#{id}", input)
      end

      def delete(id)
        @client.delete("/v1/endpoints/#{id}")
      end

      def rotate_secret(id)
        @client.post("/v1/endpoints/#{id}/rotate-secret")
      end
    end

    class Webhooks
      def initialize(client)
        @client = client
      end

      def send_webhook(input)
        @client.post('/v1/webhooks', input)
      end

      def batch(input)
        @client.post('/v1/webhooks/batch', input)
      end

      def list(limit: nil, offset: nil)
        path = '/v1/webhooks'
        params = []
        params << "limit=#{limit}" if limit
        params << "offset=#{offset}" if offset
        path += "?#{params.join('&')}" unless params.empty?
        @client.get(path)
      end

      def list_all(limit: 50)
        HookSniff::Pagination.collect_all(limit: limit) do |l, o|
          list(limit: l, offset: o)
        end
      end

      def get(id)
        @client.get("/v1/webhooks/#{id}")
      end

      def replay(id)
        @client.post("/v1/webhooks/#{id}/replay")
      end
    end

    class Auth
      def initialize(client)
        @client = client
      end

      def register(input)
        @client.post('/v1/auth/register', input)
      end

      def login(input)
        @client.post('/v1/auth/login', input)
      end

      def enable_2fa
        @client.post('/v1/auth/2fa/enable')
      end

      def verify_email(token)
        @client.get("/v1/auth/verify-email?token=#{token}")
      end

      def forgot_password(email)
        @client.post('/v1/auth/forgot-password', { email: email })
      end

      def export_data
        @client.get('/v1/auth/export')
      end

      def delete_account
        @client.delete('/v1/auth/account')
      end
    end

    class Analytics
      def initialize(client)
        @client = client
      end

      def trends(since: nil, until_val: nil)
        path = '/v1/analytics/deliveries'
        params = []
        params << "since=#{since}" if since
        params << "until=#{until_val}" if until_val
        path += "?#{params.join('&')}" unless params.empty?
        @client.get(path)
      end

      def success_rate
        @client.get('/v1/analytics/success-rate')
      end

      def latency
        @client.get('/v1/analytics/latency')
      end
    end

    class ApiKeys
      def initialize(client)
        @client = client
      end

      def list(limit: nil, offset: nil)
        path = '/v1/api-keys'
        params = []
        params << "limit=#{limit}" if limit
        params << "offset=#{offset}" if offset
        path += "?#{params.join('&')}" unless params.empty?
        @client.get(path)
      end

      def list_all(limit: 50)
        HookSniff::Pagination.collect_all(limit: limit) do |l, o|
          list(limit: l, offset: o)
        end
      end

      def create(input)
        @client.post('/v1/api-keys', input)
      end

      def delete(id)
        @client.delete("/v1/api-keys/#{id}")
      end
    end

    class Alerts
      def initialize(client)
        @client = client
      end

      def list_rules
        @client.get('/v1/alerts/rules')
      end

      def list_notifications(limit: nil)
        path = '/v1/alerts/notifications'
        path += "?limit=#{limit}" if limit
        @client.get(path)
      end
    end

    class Teams
      def initialize(client)
        @client = client
      end

      def list(limit: nil, offset: nil)
        path = '/v1/teams/members'
        params = []
        params << "limit=#{limit}" if limit
        params << "offset=#{offset}" if offset
        path += "?#{params.join('&')}" unless params.empty?
        @client.get(path)
      end

      def list_all(limit: 50)
        HookSniff::Pagination.collect_all(limit: limit) do |l, o|
          list(limit: l, offset: o)
        end
      end

      def invite(email, role)
        @client.post('/v1/teams/invite', { email: email, role: role })
      end

      def remove(member_id)
        @client.delete("/v1/teams/members/#{member_id}")
      end
    end

    class Search
      def initialize(client)
        @client = client
      end

      def query(q, limit: nil)
        path = "/v1/search?q=#{q}"
        path += "&limit=#{limit}" if limit
        @client.get(path)
      end
    end

    class Billing
      def initialize(client)
        @client = client
      end

      def get_plan
        @client.get('/v1/billing/plan')
      end

      def upgrade(plan)
        @client.post('/v1/billing/upgrade', { plan: plan })
      end

      def portal
        @client.post('/v1/billing/portal')
      end
    end

    class Health
      def initialize(client)
        @client = client
      end

      def check
        @client.get('/health')
      end
    end
  end
end
