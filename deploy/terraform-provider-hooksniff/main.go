package main

import (
	"context"
	"fmt"

	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/provider"
	"github.com/hashicorp/terraform-plugin-framework/provider/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

// HookSniffProvider implements the Terraform provider for HookSniff.
type HookSniffProvider struct {
	version string
}

// providerData holds the configuration for the provider.
type providerData struct {
	APIURL types.String `tfsdk:"api_url"`
	APIKey types.String `tfsdk:"api_key"`
}

func (p *HookSniffProvider) Metadata(_ context.Context, _ provider.MetadataRequest, resp *provider.MetadataResponse) {
	resp.TypeName = "hooksniff"
	resp.Version = p.version
}

func (p *HookSniffProvider) Schema(_ context.Context, _ provider.SchemaRequest, resp *provider.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manage HookSniff webhook infrastructure with Terraform.",
		Attributes: map[string]schema.Attribute{
			"api_url": schema.StringAttribute{
				Description: "HookSniff API base URL. Defaults to https://api.hooksniff.is-a.dev",
				Optional:    true,
			},
			"api_key": schema.StringAttribute{
				Description: "HookSniff API key for authentication.",
				Optional:    true,
				Sensitive:   true,
			},
		},
	}
}

func (p *HookSniffProvider) Configure(_ context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
	var config providerData
	diags := req.Config.Get(ctx, &config)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	apiURL := "https://api.hooksniff.is-a.dev"
	if !config.APIURL.IsNull() {
		apiURL = config.APIURL.ValueString()
	}

	apiKey := ""
	if !config.APIKey.IsNull() {
		apiKey = config.APIKey.ValueString()
	}

	client := &HookSniffClient{
		APIURL: apiURL,
		APIKey: apiKey,
	}
	resp.DataSourceData = client
	resp.ResourceData = client
}

func (p *HookSniffProvider) Resources(_ context.Context) []func() resource.Resource {
	return []func() resource.Resource{
		NewEndpointResource,
		NewAPIKeyResource,
	}
}

func (p *HookSniffProvider) DataSources(_ context.Context) []func() datasource.DataSource {
	return []func() datasource.DataSource{
		NewEndpointDataSource,
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
	provider.Serve(New("0.1.0"))
}
