# frozen_string_literal: true

module HookSniff
  class BackgroundTask
    def initialize(api_client)
      @api_client = api_client
    end

    def list
      @api_client.execute(method: :get, path: "/api/v1/background-tasks")
    end

    def get(task_id)
      @api_client.execute(method: :get, path: "/api/v1/background-tasks/#{task_id}")
    end

    def cancel(task_id)
      @api_client.execute(method: :put, path: "/api/v1/background-tasks/#{task_id}")
    end
  end
end
