# frozen_string_literal: true

module HookSniff
  class Environment
    def initialize(api_client)
      @api_client = api_client
    end

    def list
      @api_client.execute(method: :get, path: "/api/v1/environments")
    end

    def create(environment_in)
      @api_client.execute(method: :post, path: "/api/v1/environments", body: environment_in)
    end

    def get(environment_id)
      @api_client.execute(method: :get, path: "/api/v1/environments/#{environment_id}")
    end

    def update(environment_id, environment_patch)
      @api_client.execute(method: :put, path: "/api/v1/environments/#{environment_id}", body: environment_patch)
    end

    def delete(environment_id)
      @api_client.execute(method: :delete, path: "/api/v1/environments/#{environment_id}")
    end

    def list_variables(environment_id)
      @api_client.execute(method: :get, path: "/api/v1/environments/#{environment_id}/variables")
    end

    def get_variable(environment_id, variable_id)
      @api_client.execute(method: :get, path: "/api/v1/environments/#{environment_id}/variables/#{variable_id}")
    end

    def create_variable(environment_id, variable_in)
      @api_client.execute(method: :post, path: "/api/v1/environments/#{environment_id}/variables", body: variable_in)
    end

    def update_variable(environment_id, variable_id, variable_in)
      @api_client.execute(method: :put, path: "/api/v1/environments/#{environment_id}/variables/#{variable_id}", body: variable_in)
    end

    def delete_variable(environment_id, variable_id)
      @api_client.execute(method: :delete, path: "/api/v1/environments/#{environment_id}/variables/#{variable_id}")
    end

    def bulk_upsert_variables(environment_id, bulk_in)
      @api_client.execute(method: :post, path: "/api/v1/environments/#{environment_id}/variables/bulk", body: bulk_in)
    end
  end
end
