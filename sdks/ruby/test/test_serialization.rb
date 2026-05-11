# frozen_string_literal: true

require 'minitest/autorun'
require 'json'
require_relative '../lib/hooksniff-sdk/api_model_base'
require_relative '../lib/hooksniff-sdk/models/error'
require_relative '../lib/hooksniff-sdk/models/retry_policy'
require_relative '../lib/hooksniff-sdk/models/team'
require_relative '../lib/hooksniff-sdk/models/endpoint'
require_relative '../lib/hooksniff-sdk/models/delivery'
require_relative '../lib/hooksniff-sdk/models/notification'
require_relative '../lib/hooksniff-sdk/models/alert_rule'
require_relative '../lib/hooksniff-sdk/models/webhook_template'
require_relative '../lib/hooksniff-sdk/models/api_key_info'
require_relative '../lib/hooksniff-sdk/models/custom_domain'
require_relative '../lib/hooksniff-sdk/models/event_type'
require_relative '../lib/hooksniff-sdk/models/team_member'
require_relative '../lib/hooksniff-sdk/models/delivery_attempt'
require_relative '../lib/hooksniff-sdk/models/endpoint_health'
require_relative '../lib/hooksniff-sdk/models/search_result'
require_relative '../lib/hooksniff-sdk/models/routing_info'
require_relative '../lib/hooksniff-sdk/models/domain_dns_record'
require_relative '../lib/hooksniff-sdk/models/webhook_filter'
require_relative '../lib/hooksniff-sdk/models/portal_profile'
require_relative '../lib/hooksniff-sdk/models/notification_preferences'
require_relative '../lib/hooksniff-sdk/models/stats_response'

class SerializationTest < Minitest::Test
  # ========================================
  # 2.3: HTTP Library Verification (Typhoeus)
  # ========================================

  def test_http_library_is_typhoeus
    gemspec = File.read(File.join(__dir__, '..', 'hooksniff-sdk.gemspec'))
    assert_includes gemspec, 'typhoeus', 'SDK must use Typhoeus as HTTP library'
  end

  def test_api_client_uses_typhoeus_request
    api_client_path = File.join(__dir__, '..', 'lib/hooksniff-sdk/api_client.rb')
    content = File.read(api_client_path)
    assert_includes content, "require 'typhoeus'"
    assert_includes content, 'Typhoeus::Request.new'
  end

  def test_api_client_builds_request_with_typhoeus
    api_client_path = File.join(__dir__, '..', 'lib/hooksniff-sdk/api_client.rb')
    content = File.read(api_client_path)
    assert_includes content, 'Typhoeus::Request.new(url, req_opts)'
  end

  # ========================================
  # 2.4: Serialization — Error Model
  # ========================================

  def test_error_to_json
    error = HooksniffSdk::Error.new(error: 'Not Found')
    json = error.to_json
    parsed = JSON.parse(json)
    assert_equal 'Not Found', parsed['error']
  end

  def test_error_from_json
    json = '{"error":"Server Error"}'
    error = HooksniffSdk::Error.from_json(json)
    assert_instance_of HooksniffSdk::Error, error
    assert_equal 'Server Error', error.error
  end

  def test_error_roundtrip
    original = HooksniffSdk::Error.new(error: 'Bad Request')
    restored = HooksniffSdk::Error.from_json(original.to_json)
    assert_equal original, restored
  end

  def test_from_json_nil_returns_nil
    assert_nil HooksniffSdk::Error.from_json(nil)
  end

  def test_from_json_empty_string_returns_nil
    assert_nil HooksniffSdk::Error.from_json('')
  end

  # ========================================
  # 2.4: Serialization — RetryPolicy Model
  # ========================================

  def test_retry_policy_to_json
    rp = HooksniffSdk::RetryPolicy.new(
      max_attempts: 5, backoff: 'linear',
      initial_delay_secs: 20, max_delay_secs: 600
    )
    parsed = JSON.parse(rp.to_json)
    assert_equal 5, parsed['max_attempts']
    assert_equal 'linear', parsed['backoff']
    assert_equal 20, parsed['initial_delay_secs']
    assert_equal 600, parsed['max_delay_secs']
  end

  def test_retry_policy_from_json
    json = '{"max_attempts":3,"backoff":"exponential","initial_delay_secs":10,"max_delay_secs":3600}'
    rp = HooksniffSdk::RetryPolicy.from_json(json)
    assert_instance_of HooksniffSdk::RetryPolicy, rp
    assert_equal 3, rp.max_attempts
    assert_equal 'exponential', rp.backoff
    assert_equal 10, rp.initial_delay_secs
    assert_equal 3600, rp.max_delay_secs
  end

  def test_retry_policy_defaults_roundtrip
    original = HooksniffSdk::RetryPolicy.new
    restored = HooksniffSdk::RetryPolicy.from_json(original.to_json)
    assert_equal original, restored
  end

  # ========================================
  # 2.4: Serialization — Team Model (Time)
  # ========================================

  def test_team_to_json
    now = Time.at(Time.now.to_i)
    team = HooksniffSdk::Team.new(id: 'team_1', name: 'Engineering', created_at: now)
    parsed = JSON.parse(team.to_json)
    assert_equal 'team_1', parsed['id']
    assert_equal 'Engineering', parsed['name']
    assert parsed.key?('created_at')
  end

  def test_team_from_json_restores_time
    now = Time.at(Time.now.to_i)
    team = HooksniffSdk::Team.new(id: 't1', name: 'Ops', created_at: now)
    restored = HooksniffSdk::Team.from_json(team.to_json)
    assert_instance_of Time, restored.created_at
    assert_equal now.to_i, restored.created_at.to_i
  end

  # ========================================
  # 2.4: Serialization — Endpoint (Nested Objects)
  # ========================================

  def test_endpoint_with_nested_retry_policy
    rp = HooksniffSdk::RetryPolicy.new(max_attempts: 5, backoff: 'linear', initial_delay_secs: 15, max_delay_secs: 300)
    ep = HooksniffSdk::Endpoint.new(
      id: 'ep_123', url: 'https://example.com/webhook',
      is_active: true, retry_policy: rp,
      created_at: Time.at(Time.now.to_i), routing_strategy: 'failover',
      avg_response_ms: 120, failure_streak: 0, format: 'standard'
    )
    parsed = JSON.parse(ep.to_json)
    assert_equal 'ep_123', parsed['id']
    assert_instance_of Hash, parsed['retry_policy']
    assert_equal 5, parsed['retry_policy']['max_attempts']
    assert_equal 'linear', parsed['retry_policy']['backoff']
  end

  def test_endpoint_from_json_deserializes_nested
    json = '{"id":"ep_456","url":"https://test.com/hook","is_active":true,"retry_policy":{"max_attempts":3,"backoff":"exponential","initial_delay_secs":10,"max_delay_secs":3600},"created_at":"2026-01-01 00:00:00 +0000","routing_strategy":"round-robin","avg_response_ms":50,"failure_streak":2,"format":"standard"}'
    ep = HooksniffSdk::Endpoint.from_json(json)
    assert_instance_of HooksniffSdk::Endpoint, ep
    assert_instance_of HooksniffSdk::RetryPolicy, ep.retry_policy
    assert_equal 3, ep.retry_policy.max_attempts
    assert_equal 'ep_456', ep.id
    assert_equal 'round-robin', ep.routing_strategy
  end

  def test_endpoint_roundtrip_preserves_nested
    rp = HooksniffSdk::RetryPolicy.new(max_attempts: 7, backoff: 'fixed', initial_delay_secs: 30, max_delay_secs: 120)
    ep = HooksniffSdk::Endpoint.new(
      id: 'ep_789', url: 'https://api.example.com/recv',
      is_active: false, retry_policy: rp,
      created_at: Time.at(Time.now.to_i), routing_strategy: 'latency',
      avg_response_ms: 200, failure_streak: 5, format: 'cloudevents'
    )
    restored = HooksniffSdk::Endpoint.from_json(ep.to_json)
    assert_equal ep.id, restored.id
    assert_equal ep.url, restored.url
    assert_equal ep.is_active, restored.is_active
    assert_equal ep.routing_strategy, restored.routing_strategy
    assert_equal ep.format, restored.format
    assert_equal ep.retry_policy.max_attempts, restored.retry_policy.max_attempts
    assert_equal ep.retry_policy.backoff, restored.retry_policy.backoff
  end

  # ========================================
  # 2.4: Serialization — Delivery (Enum)
  # ========================================

  def test_delivery_to_json
    d = HooksniffSdk::Delivery.new(
      id: 'del_1', endpoint_id: 'ep_1', event: 'order.created',
      status: 'delivered', attempt_count: 2, replay_count: 0,
      created_at: Time.at(Time.now.to_i)
    )
    parsed = JSON.parse(d.to_json)
    assert_equal 'delivered', parsed['status']
    assert_equal 2, parsed['attempt_count']
  end

  def test_delivery_from_json
    json = '{"id":"del_2","endpoint_id":"ep_2","event":"user.signup","status":"pending","attempt_count":0,"replay_count":0,"created_at":"2026-01-15 12:00:00 +0000"}'
    d = HooksniffSdk::Delivery.from_json(json)
    assert_equal 'del_2', d.id
    assert_equal 'pending', d.status
    assert_equal 0, d.attempt_count
  end

  def test_delivery_enum_values
    %w[pending processing delivered failed].each do |status|
      d = HooksniffSdk::Delivery.new(
        id: 'd1', endpoint_id: 'ep1', status: status,
        attempt_count: 0, replay_count: 0, created_at: Time.now
      )
      assert_equal status, d.status
    end
  end

  # ========================================
  # 2.4: Serialization — Notification (Boolean + Nullable)
  # ========================================

  def test_notification_to_json
    n = HooksniffSdk::Notification.new(
      id: 'n1', title: 'Alert', body: 'Endpoint down',
      is_read: false, link: nil, created_at: Time.at(Time.now.to_i)
    )
    parsed = JSON.parse(n.to_json)
    assert_equal false, parsed['is_read']
    assert_equal 'Alert', parsed['title']
  end

  def test_notification_roundtrip
    n = HooksniffSdk::Notification.new(
      id: 'n2', title: 'Info', body: 'All clear',
      is_read: true, link: '/dashboard', created_at: Time.at(Time.now.to_i)
    )
    restored = HooksniffSdk::Notification.from_json(n.to_json)
    assert_equal n.id, restored.id
    assert_equal n.title, restored.title
    assert_equal n.is_read, restored.is_read
    assert_equal n.link, restored.link
  end

  # ========================================
  # 2.4: Serialization — AlertRule (Arrays)
  # ========================================

  def test_alert_rule_to_json_with_array
    ar = HooksniffSdk::AlertRule.new(
      id: 'ar_1', name: 'High Failures', condition: 'failure_rate',
      threshold: 10, channels: ['email', 'slack', 'pagerduty'],
      is_active: true, created_at: Time.at(Time.now.to_i)
    )
    parsed = JSON.parse(ar.to_json)
    assert_equal ['email', 'slack', 'pagerduty'], parsed['channels']
    assert_equal 10, parsed['threshold']
  end

  def test_alert_rule_from_json_with_array
    json = '{"id":"ar_2","name":"Slow Response","condition":"latency","threshold":5000,"channels":["email"],"is_active":false,"created_at":"2026-03-01 00:00:00 +0000"}'
    ar = HooksniffSdk::AlertRule.from_json(json)
    assert_equal ['email'], ar.channels
    assert_equal 'latency', ar.condition
    assert_equal false, ar.is_active
  end

  # ========================================
  # 2.4: Serialization — WebhookTemplate
  # ========================================

  def test_webhook_template_to_json
    wt = HooksniffSdk::WebhookTemplate.new(
      id: 'tpl_1', name: 'Order Created', description: 'Fires on new orders',
      category: 'ecommerce', payload_template: { 'event' => 'order.created', 'data' => {} }
    )
    parsed = JSON.parse(wt.to_json)
    assert_equal 'tpl_1', parsed['id']
    assert_instance_of Hash, parsed['payload_template']
  end

  def test_webhook_template_roundtrip
    wt = HooksniffSdk::WebhookTemplate.new(
      id: 'tpl_2', name: 'User Signup', description: 'New user registered',
      category: 'auth', payload_template: { 'event' => 'user.created' }
    )
    restored = HooksniffSdk::WebhookTemplate.from_json(wt.to_json)
    assert_equal wt.id, restored.id
    assert_equal wt.name, restored.name
    # payload_template roundtrips through JSON — keys become symbols
    assert_equal 'user.created', restored.payload_template[:event] || restored.payload_template['event']
  end

  # ========================================
  # 2.4: Serialization — ApiKeyInfo
  # ========================================

  def test_api_key_info_serialization
    key = HooksniffSdk::ApiKeyInfo.new(
      id: 'key_1', prefix: 'hs_abc',
      created_at: Time.at(Time.now.to_i), is_active: true
    )
    json = key.to_json
    restored = HooksniffSdk::ApiKeyInfo.from_json(json)
    assert_equal key.id, restored.id
    assert_equal key.prefix, restored.prefix
    assert_equal key.is_active, restored.is_active
  end

  # ========================================
  # 2.4: Serialization — CustomDomain
  # ========================================

  def test_custom_domain_serialization
    cd = HooksniffSdk::CustomDomain.new(
      id: 'cd_1', domain: 'hooks.example.com',
      status: 'verified', created_at: Time.at(Time.now.to_i)
    )
    json = cd.to_json
    parsed = JSON.parse(json)
    assert_equal 'hooks.example.com', parsed['domain']
    restored = HooksniffSdk::CustomDomain.from_json(json)
    assert_equal cd.domain, restored.domain
  end

  # ========================================
  # 2.4: Serialization — EventType
  # ========================================

  def test_event_type_serialization
    et = HooksniffSdk::EventType.new(
      id: 'evt_1', name: 'order.created', description: 'New order placed'
    )
    json = et.to_json
    restored = HooksniffSdk::EventType.from_json(json)
    assert_equal et.name, restored.name
    assert_equal et.description, restored.description
  end

  # ========================================
  # 2.4: Serialization — TeamMember
  # ========================================

  def test_team_member_serialization
    tm = HooksniffSdk::TeamMember.new(
      id: 'tm_1', user_id: 'u_1', email: 'alice@example.com',
      name: 'Alice', role: 'admin', joined_at: Time.at(Time.now.to_i)
    )
    json = tm.to_json
    restored = HooksniffSdk::TeamMember.from_json(json)
    assert_equal tm.email, restored.email
    assert_equal tm.role, restored.role
    assert_equal tm.user_id, restored.user_id
  end

  # ========================================
  # 2.4: Serialization — DeliveryAttempt
  # ========================================

  def test_delivery_attempt_serialization
    da = HooksniffSdk::DeliveryAttempt.new(
      id: 'da_1', attempt_number: 1, status_code: 200,
      duration_ms: 150, created_at: Time.at(Time.now.to_i)
    )
    json = da.to_json
    parsed = JSON.parse(json)
    assert_equal 200, parsed['status_code']
    assert_equal 150, parsed['duration_ms']
  end

  # ========================================
  # 2.4: Serialization — EndpointHealth
  # ========================================

  def test_endpoint_health_serialization
    eh = HooksniffSdk::EndpointHealth.new(
      endpoint_id: 'ep_1', is_healthy: true,
      success_rate: 99.5, avg_latency_ms: 120,
      total_deliveries: 1000, failed_deliveries: 5
    )
    json = eh.to_json
    parsed = JSON.parse(json)
    assert_equal 99.5, parsed['success_rate']
    assert_equal 120, parsed['avg_latency_ms']
    assert_equal true, parsed['is_healthy']
  end

  # ========================================
  # 2.4: Serialization — DomainDnsRecord
  # ========================================

  def test_domain_dns_record_serialization
    dns = HooksniffSdk::DomainDnsRecord.new(
      type: 'CNAME', name: 'hooks.example.com', value: 'proxy.hooksniff.com'
    )
    json = dns.to_json
    restored = HooksniffSdk::DomainDnsRecord.from_json(json)
    assert_equal 'CNAME', restored.type
    assert_equal 'hooks.example.com', restored.name
  end

  # ========================================
  # 2.4: Serialization — RoutingInfo
  # ========================================

  def test_routing_info_serialization
    ri = HooksniffSdk::RoutingInfo.new(
      endpoint_id: 'ep_1', routing_strategy: 'failover',
      fallback_url: 'https://fallback.example.com', is_healthy: true
    )
    json = ri.to_json
    restored = HooksniffSdk::RoutingInfo.from_json(json)
    assert_equal ri.endpoint_id, restored.endpoint_id
    assert_equal ri.routing_strategy, restored.routing_strategy
    assert_equal ri.fallback_url, restored.fallback_url
  end

  # ========================================
  # 2.4: Serialization — NotificationPreferences
  # ========================================

  def test_notification_preferences_serialization
    np = HooksniffSdk::NotificationPreferences.new(
      email_on_failure: true, email_on_dead_letter: false,
      slack_webhook_url: 'https://hooks.slack.com/test'
    )
    json = np.to_json
    restored = HooksniffSdk::NotificationPreferences.from_json(json)
    assert_equal np.email_on_failure, restored.email_on_failure
    assert_equal np.slack_webhook_url, restored.slack_webhook_url
  end

  # ========================================
  # 2.4: Serialization — PortalProfile
  # ========================================

  def test_portal_profile_serialization
    pp = HooksniffSdk::PortalProfile.new(
      id: 'pp_1', email: 'user@example.com', name: 'Test User',
      plan: 'pro', created_at: Time.at(Time.now.to_i)
    )
    json = pp.to_json
    restored = HooksniffSdk::PortalProfile.from_json(json)
    assert_equal pp.email, restored.email
    assert_equal pp.name, restored.name
    assert_equal pp.plan, restored.plan
  end

  # ========================================
  # 2.4: Serialization — StatsResponse
  # ========================================

  def test_stats_response_serialization
    stats = HooksniffSdk::StatsResponse.new(
      total_endpoints: 10, total_deliveries: 5000,
      successful_deliveries: 4925, failed_deliveries: 75,
      active_endpoints: 8, plan: 'pro', webhook_limit: 1000, webhook_count: 500
    )
    json = stats.to_json
    parsed = JSON.parse(json)
    assert_equal 10, parsed['total_endpoints']
    assert_equal 5000, parsed['total_deliveries']
    assert_equal 'pro', parsed['plan']
  end

  # ========================================
  # 2.4: Serialization — Edge Cases
  # ========================================

  def test_to_json_produces_valid_json
    rp = HooksniffSdk::RetryPolicy.new
    json = rp.to_json
    parsed = JSON.parse(json)
    assert_instance_of Hash, parsed
  end

  def test_from_json_rejects_invalid_json
    assert_raises(JSON::ParserError) do
      HooksniffSdk::Error.from_json('not valid json {{{')
    end
  end

  def test_to_json_pretty_produces_formatted_output
    error = HooksniffSdk::Error.new(error: 'test')
    pretty = error.to_json_pretty
    assert_includes pretty, "\n"
    assert_includes pretty, '  '
  end

  def test_to_json_is_inherited_from_api_model_base
    # to_json is defined on ApiModelBase, inherited by all models
    assert HooksniffSdk::ApiModelBase.method_defined?(:to_json),
      'to_json must be defined on ApiModelBase'
    assert HooksniffSdk::Error.method_defined?(:to_json),
      'Error must inherit to_json'
  end

  def test_from_json_is_class_method
    assert HooksniffSdk::Error.respond_to?(:from_json),
      'from_json must be a class method'
    assert HooksniffSdk::Endpoint.respond_to?(:from_json),
      'Endpoint must respond to from_json'
  end

  def test_all_key_models_have_serialization
    models = [
      HooksniffSdk::Error,
      HooksniffSdk::RetryPolicy,
      HooksniffSdk::Team,
      HooksniffSdk::Endpoint,
      HooksniffSdk::Delivery,
      HooksniffSdk::Notification,
      HooksniffSdk::AlertRule,
      HooksniffSdk::WebhookTemplate,
      HooksniffSdk::ApiKeyInfo,
      HooksniffSdk::CustomDomain,
      HooksniffSdk::EventType,
      HooksniffSdk::TeamMember,
      HooksniffSdk::DeliveryAttempt,
      HooksniffSdk::EndpointHealth,
      HooksniffSdk::RoutingInfo,
      HooksniffSdk::NotificationPreferences,
      HooksniffSdk::PortalProfile,
      HooksniffSdk::StatsResponse
    ]
    models.each do |klass|
      assert klass.respond_to?(:from_json), "#{klass.name} must respond to from_json"
      assert klass.method_defined?(:to_json), "#{klass.name} must have to_json"
      assert klass.method_defined?(:to_json_pretty), "#{klass.name} must have to_json_pretty"
    end
  end

  def test_json_special_characters
    error = HooksniffSdk::Error.new(error: 'test "quotes" & <html> \\backslash')
    json = error.to_json
    parsed = JSON.parse(json)
    assert_equal 'test "quotes" & <html> \\backslash', parsed['error']
  end

  def test_webhook_filter_serialization
    wf = HooksniffSdk::WebhookFilter.new(
      status: 'delivered', endpoint_id: 'ep_1',
      event_type: 'order.created', page: 1, per_page: 20
    )
    json = wf.to_json
    restored = HooksniffSdk::WebhookFilter.from_json(json)
    assert_equal wf.status, restored.status
    assert_equal wf.endpoint_id, restored.endpoint_id
    assert_equal wf.page, restored.page
  end

  def test_search_result_serialization
    sr = HooksniffSdk::SearchResult.new(
      deliveries: [], total: 42
    )
    json = sr.to_json
    parsed = JSON.parse(json)
    assert_equal 42, parsed['total']
    assert_equal [], parsed['deliveries']
  end
end
