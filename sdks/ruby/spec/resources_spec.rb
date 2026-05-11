# frozen_string_literal: true

require 'spec_helper'
require 'hooksniff/client'
require 'hooksniff/resources/all'

RSpec.describe HookSniff::Client do
  let(:api_key) { 'test_api_key_12345' }
  let(:client) { described_class.new(api_key: api_key) }

  describe '#initialize' do
    it 'creates a client with default settings' do
      expect(client).to be_a(described_class)
    end

    it 'raises ArgumentError when api_key is nil' do
      expect { described_class.new(api_key: nil) }
        .to raise_error(ArgumentError, /apiKey is required/)
    end

    it 'raises ArgumentError when api_key is empty' do
      expect { described_class.new(api_key: '') }
        .to raise_error(ArgumentError, /apiKey is required/)
    end

    it 'accepts a custom base_url' do
      c = described_class.new(api_key: 'key', base_url: 'https://custom.example.com')
      expect(c).to be_a(described_class)
    end

    it 'accepts custom timeout and retries' do
      c = described_class.new(api_key: 'key', timeout: 10, num_retries: 5)
      expect(c).to be_a(described_class)
    end
  end

  describe 'resource accessors' do
    it 'exposes endpoints resource' do
      expect(client.endpoints).to be_a(HookSniff::Resources::Endpoints)
    end

    it 'exposes webhooks resource' do
      expect(client.webhooks).to be_a(HookSniff::Resources::Webhooks)
    end

    it 'exposes auth resource' do
      expect(client.auth).to be_a(HookSniff::Resources::Auth)
    end

    it 'exposes analytics resource' do
      expect(client.analytics).to be_a(HookSniff::Resources::Analytics)
    end

    it 'exposes api_keys resource' do
      expect(client.api_keys).to be_a(HookSniff::Resources::ApiKeys)
    end

    it 'exposes alerts resource' do
      expect(client.alerts).to be_a(HookSniff::Resources::Alerts)
    end

    it 'exposes teams resource' do
      expect(client.teams).to be_a(HookSniff::Resources::Teams)
    end

    it 'exposes search resource' do
      expect(client.search).to be_a(HookSniff::Resources::Search)
    end

    it 'exposes billing resource' do
      expect(client.billing).to be_a(HookSniff::Resources::Billing)
    end

    it 'exposes health resource' do
      expect(client.health).to be_a(HookSniff::Resources::Health)
    end
  end

  describe 'HTTP verbs' do
    it 'exposes get, post, put, delete methods' do
      expect(client).to respond_to(:get)
      expect(client).to respond_to(:post)
      expect(client).to respond_to(:put)
      expect(client).to respond_to(:delete)
    end
  end
end

RSpec.describe HookSniff::Resources::Endpoints do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#list' do
    it 'calls client.get with path and params' do
      expect(client).to receive(:get).with('/v1/endpoints?limit=10&offset=5')
      resource.list(limit: 10, offset: 5)
    end

    it 'calls client.get without params when none given' do
      expect(client).to receive(:get).with('/v1/endpoints')
      resource.list
    end
  end

  describe '#create' do
    it 'calls client.post with input data' do
      input = { 'url' => 'https://example.com/hook' }
      expect(client).to receive(:post).with('/v1/endpoints', input)
      resource.create(input)
    end
  end

  describe '#get' do
    it 'calls client.get with endpoint id' do
      expect(client).to receive(:get).with('/v1/endpoints/ep_123')
      resource.get('ep_123')
    end
  end

  describe '#update' do
    it 'calls client.put with id and input' do
      input = { 'url' => 'https://new.example.com' }
      expect(client).to receive(:put).with('/v1/endpoints/ep_123', input)
      resource.update('ep_123', input)
    end
  end

  describe '#delete' do
    it 'calls client.delete with endpoint id' do
      expect(client).to receive(:delete).with('/v1/endpoints/ep_123')
      resource.delete('ep_123')
    end
  end

  describe '#rotate_secret' do
    it 'calls client.post for secret rotation' do
      expect(client).to receive(:post).with('/v1/endpoints/ep_123/rotate-secret')
      resource.rotate_secret('ep_123')
    end
  end
end

RSpec.describe HookSniff::Resources::Webhooks do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#send_webhook' do
    it 'calls client.post with input' do
      input = { 'event' => 'test', 'payload' => { 'id' => 1 } }
      expect(client).to receive(:post).with('/v1/webhooks', input)
      resource.send_webhook(input)
    end
  end

  describe '#batch' do
    it 'calls client.post for batch sending' do
      input = { 'events' => [{ 'event' => 'a' }, { 'event' => 'b' }] }
      expect(client).to receive(:post).with('/v1/webhooks/batch', input)
      resource.batch(input)
    end
  end

  describe '#list' do
    it 'calls client.get with params' do
      expect(client).to receive(:get).with('/v1/webhooks?limit=20')
      resource.list(limit: 20)
    end

    it 'calls client.get without params' do
      expect(client).to receive(:get).with('/v1/webhooks')
      resource.list
    end
  end

  describe '#get' do
    it 'calls client.get with webhook id' do
      expect(client).to receive(:get).with('/v1/webhooks/wh_456')
      resource.get('wh_456')
    end
  end

  describe '#replay' do
    it 'calls client.post for replay' do
      expect(client).to receive(:post).with('/v1/webhooks/wh_456/replay')
      resource.replay('wh_456')
    end
  end
end

RSpec.describe HookSniff::Resources::Auth do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#register' do
    it 'calls client.post with registration data' do
      input = { 'email' => 'test@example.com', 'password' => 'secret' }
      expect(client).to receive(:post).with('/v1/auth/register', input)
      resource.register(input)
    end
  end

  describe '#login' do
    it 'calls client.post with login data' do
      input = { 'email' => 'test@example.com', 'password' => 'secret' }
      expect(client).to receive(:post).with('/v1/auth/login', input)
      resource.login(input)
    end
  end

  describe '#enable_2fa' do
    it 'calls client.post to enable 2FA' do
      expect(client).to receive(:post).with('/v1/auth/2fa/enable')
      resource.enable_2fa
    end
  end

  describe '#verify_email' do
    it 'calls client.get with token' do
      expect(client).to receive(:get).with('/v1/auth/verify-email?token=abc123')
      resource.verify_email('abc123')
    end
  end

  describe '#forgot_password' do
    it 'calls client.post with email' do
      expect(client).to receive(:post).with('/v1/auth/forgot-password', { email: 'test@example.com' })
      resource.forgot_password('test@example.com')
    end
  end

  describe '#export_data' do
    it 'calls client.get for data export' do
      expect(client).to receive(:get).with('/v1/auth/export')
      resource.export_data
    end
  end

  describe '#delete_account' do
    it 'calls client.delete for account deletion' do
      expect(client).to receive(:delete).with('/v1/auth/account')
      resource.delete_account
    end
  end
end

RSpec.describe HookSniff::Resources::Analytics do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#trends' do
    it 'calls client.get with query params' do
      expect(client).to receive(:get).with('/v1/analytics/deliveries?since=2024-01-01&until=2024-01-31')
      resource.trends(since: '2024-01-01', until_val: '2024-01-31')
    end

    it 'calls client.get without params' do
      expect(client).to receive(:get).with('/v1/analytics/deliveries')
      resource.trends
    end
  end

  describe '#success_rate' do
    it 'calls client.get' do
      expect(client).to receive(:get).with('/v1/analytics/success-rate')
      resource.success_rate
    end
  end

  describe '#latency' do
    it 'calls client.get' do
      expect(client).to receive(:get).with('/v1/analytics/latency')
      resource.latency
    end
  end
end

RSpec.describe HookSniff::Resources::ApiKeys do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#list' do
    it 'calls client.get with params' do
      expect(client).to receive(:get).with('/v1/api-keys?limit=5&offset=10')
      resource.list(limit: 5, offset: 10)
    end

    it 'calls client.get without params' do
      expect(client).to receive(:get).with('/v1/api-keys')
      resource.list
    end
  end

  describe '#create' do
    it 'calls client.post with input' do
      input = { 'name' => 'my-key' }
      expect(client).to receive(:post).with('/v1/api-keys', input)
      resource.create(input)
    end
  end

  describe '#delete' do
    it 'calls client.delete with key id' do
      expect(client).to receive(:delete).with('/v1/api-keys/key_789')
      resource.delete('key_789')
    end
  end
end

RSpec.describe HookSniff::Resources::Alerts do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#list_rules' do
    it 'calls client.get' do
      expect(client).to receive(:get).with('/v1/alerts/rules')
      resource.list_rules
    end
  end

  describe '#list_notifications' do
    it 'calls client.get with limit param' do
      expect(client).to receive(:get).with('/v1/alerts/notifications?limit=10')
      resource.list_notifications(limit: 10)
    end

    it 'calls client.get without params' do
      expect(client).to receive(:get).with('/v1/alerts/notifications')
      resource.list_notifications
    end
  end
end

RSpec.describe HookSniff::Resources::Teams do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#list' do
    it 'calls client.get with params' do
      expect(client).to receive(:get).with('/v1/teams/members?limit=50')
      resource.list(limit: 50)
    end
  end

  describe '#invite' do
    it 'calls client.post with email and role' do
      expect(client).to receive(:post).with('/v1/teams/invite', { email: 'new@example.com', role: 'admin' })
      resource.invite('new@example.com', 'admin')
    end
  end

  describe '#remove' do
    it 'calls client.delete with member id' do
      expect(client).to receive(:delete).with('/v1/teams/members/member_001')
      resource.remove('member_001')
    end
  end
end

RSpec.describe HookSniff::Resources::Search do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#query' do
    it 'calls client.get with search query' do
      expect(client).to receive(:get).with('/v1/search?q=test')
      resource.query('test')
    end

    it 'calls client.get with query and limit' do
      expect(client).to receive(:get).with('/v1/search?q=test&limit=5')
      resource.query('test', limit: 5)
    end
  end
end

RSpec.describe HookSniff::Resources::Billing do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#get_plan' do
    it 'calls client.get' do
      expect(client).to receive(:get).with('/v1/billing/plan')
      resource.get_plan
    end
  end

  describe '#upgrade' do
    it 'calls client.post with plan' do
      expect(client).to receive(:post).with('/v1/billing/upgrade', { plan: 'pro' })
      resource.upgrade('pro')
    end
  end

  describe '#portal' do
    it 'calls client.post' do
      expect(client).to receive(:post).with('/v1/billing/portal')
      resource.portal
    end
  end
end

RSpec.describe HookSniff::Resources::Health do
  let(:client) { double('client') }
  let(:resource) { described_class.new(client) }

  describe '#check' do
    it 'calls client.get on health endpoint' do
      expect(client).to receive(:get).with('/health')
      resource.check
    end
  end
end
