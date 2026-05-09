package main

import (
	"context"
	"fmt"
	"os"

	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/provider"
	"github.com/hashicorp/terraform-plugin-framework/provider/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/types"
	"github.com/hashicorp/terraform-plugin-log/tflog"
)

// Ensure the implementation satisfies the provider.Provider interface.
var _ provider.Provider = &HookSniffProvider{}

// HookSniffProvider defines the provider implementation.
type HookSniffProvider struct {
	version string
}

// HookSniffProviderModel describes the provider data model.
type HookSniffProviderModel struct {
	APIKey  types.String `tfsdk:"api_key"`
	BaseURL types.String `tfsdk:"base_url"`
}

func (p *HookSniffProvider) Metadata(_ context.Context, _ provider.MetadataRequest, resp *provider.MetadataResponse) {
	resp.TypeName = "hooksniff"
	resp.Version = p.version
}

func (p *HookSniffProvider) Schema(_ context.Context, _ provider.SchemaRequest, resp *provider.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manage HookSniff webhook infrastructure as code.",
		Attributes: map[string]schema.Attribute{
			"api_key": schema.StringAttribute{
				Description: "HookSniff API key. Can also be set via the HOOKSNIFF_API_KEY environment variable.",
				Optional:    true,
				Sensitive:   true,
			},
			"base_url": schema.StringAttribute{
				Description: "HookSniff API base URL. Defaults to https://api.hooksniff.dev/v1. Use for self-hosted instances.",
				Optional:    true,
			},
		},
	}
}

func (p *HookSniffProvider) Configure(ctx context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
	var config HookSniffProviderModel

	resp.Diagnostics.Append(req.Config.Get(ctx, &config)...)
	if resp.Diagnostics.HasError() {
		return
	}

	// If practitioner provided a configuration value, it must not be unknown.
	if config.APIKey.IsUnknown() {
		resp.Diagnostics.AddAttributeError(
			path.Root("api_key"),
			"Unknown HookSniff API Key",
			"The provider cannot create the HookSniff API client as there is an unknown configuration value for the HookSniff API key. "+
				"Either target apply the source of the value first, set the value statically in the configuration, or use the HOOKSNIFF_API_KEY environment variable.",
		)
	}

	if resp.Diagnostics.HasError() {
		return
	}

	// Default values to environment variables, but override
	// with Terraform configuration value if set.
	apiKey := os.Getenv("HOOKSNIFF_API_KEY")
	baseURL := "https://api.hooksniff.dev/v1"

	if !config.APIKey.IsNull() {
		apiKey = config.APIKey.ValueString()
	}

	if !config.BaseURL.IsNull() {
		baseURL = config.BaseURL.ValueString()
	}

	// If any of the expected configurations are missing, return
	// errors with provider-specific guidance.
	if apiKey == "" {
		resp.Diagnostics.AddAttributeError(
			path.Root("api_key"),
			"Missing HookSniff API Key",
			"The provider cannot create the HookSniff API client as there is a missing or empty value for the HookSniff API key. "+
				"Set the api_key value in the configuration or use the HOOKSNIFF_API_KEY environment variable. "+
				"If either is already set, ensure the value is not empty.",
		)
	}

	if resp.Diagnostics.HasError() {
		return
	}

	ctx = tflog.SetField(ctx, "hooksniff_base_url", baseURL)
	ctx = tflog.SetField(ctx, "hooksniff_api_key", apiKey)
	tflog.Debug(ctx, "Creating HookSniff client")

	// Create the client (placeholder — real implementation would use HTTP client)
	client := &HookSniffClient{
		APIKey:  apiKey,
		BaseURL: baseURL,
	}

	resp.DataSourceData = client
	resp.ResourceData = client
}

func (p *HookSniffProvider) Resources(_ context.Context) []func() resource.Resource {
	return []func() resource.Resource{
		NewEndpointResource,
		NewAPIKeyResource,
		NewSchemaResource,
		NewEventTypeResource,
	}
}

func (p *HookSniffProvider) DataSources(_ context.Context) []func() datasource.DataSource {
	return []func() datasource.DataSource{
		NewEndpointDataSource,
		NewEndpointsDataSource,
	}
}

func New(version string) func() provider.Provider {
	return func() provider.Provider {
		return &HookSniffProvider{
			version: version,
		}
	}
}

func main() {
	opts := provider.ServeOpts{
		Address: "registry.terraform.io/hooksniff/hooksniff",
	}

	provider.Serve(New("0.1.0")(func() provider.Provider { return &HookSniffProvider{version: "0.1.0"} }), opts)
}
