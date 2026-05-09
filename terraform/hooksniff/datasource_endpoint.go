package main

import (
	"context"
	"fmt"

	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/datasource/schema"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

var _ datasource.DataSource = &EndpointDataSource{}
var _ datasource.DataSource = &EndpointsDataSource{}

// ─── Single Endpoint Data Source ───

type EndpointDataSource struct {
	client *HookSniffClient
}

type EndpointDataSourceModel struct {
	ID            types.String `tfsdk:"id"`
	URL           types.String `tfsdk:"url"`
	Description   types.String `tfsdk:"description"`
	IsActive      types.Bool   `tfsdk:"is_active"`
	CreatedAt     types.String `tfsdk:"created_at"`
	FailureStreak types.Int64  `tfsdk:"failure_streak"`
}

func NewEndpointDataSource() datasource.DataSource { return &EndpointDataSource{} }

func (d *EndpointDataSource) Metadata(_ context.Context, req datasource.MetadataRequest, resp *datasource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_endpoint"
}

func (d *EndpointDataSource) Schema(_ context.Context, _ datasource.SchemaRequest, resp *datasource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Fetches a HookSniff endpoint by ID.",
		Attributes: map[string]schema.Attribute{
			"id":             schema.StringAttribute{Required: true},
			"url":            schema.StringAttribute{Computed: true},
			"description":    schema.StringAttribute{Computed: true},
			"is_active":      schema.BoolAttribute{Computed: true},
			"created_at":     schema.StringAttribute{Computed: true},
			"failure_streak": schema.Int64Attribute{Computed: true},
		},
	}
}

func (d *EndpointDataSource) Configure(_ context.Context, req datasource.ConfigureRequest, resp *datasource.ConfigureResponse) {
	if req.ProviderData != nil {
		d.client = req.ProviderData.(*HookSniffClient)
	}
}

func (d *EndpointDataSource) Read(ctx context.Context, req datasource.ReadRequest, resp *datasource.ReadResponse) {
	var config EndpointDataSourceModel
	resp.Diagnostics.Append(req.Config.Get(ctx, &config)...)
	if resp.Diagnostics.HasError() {
		return
	}

	ep, err := d.client.GetEndpoint(config.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Failed to read endpoint", err.Error())
		return
	}

	config.URL = types.StringValue(ep.URL)
	config.Description = types.StringValue(ep.Description)
	config.IsActive = types.BoolValue(ep.IsActive)
	config.CreatedAt = types.StringValue(ep.CreatedAt.Format("2006-01-02T15:04:05Z"))
	config.FailureStreak = types.Int64Value(int64(ep.FailureStreak))

	resp.Diagnostics.Append(resp.State.Set(ctx, &config)...)
}

// ─── List Endpoints Data Source ───

type EndpointsDataSource struct {
	client *HookSniffClient
}

type EndpointsDataSourceModel struct {
	Endpoints []EndpointDataSourceModel `tfsdk:"endpoints"`
}

func NewEndpointsDataSource() datasource.DataSource { return &EndpointsDataSource{} }

func (d *EndpointsDataSource) Metadata(_ context.Context, req datasource.MetadataRequest, resp *datasource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_endpoints"
}

func (d *EndpointsDataSource) Schema(_ context.Context, _ datasource.SchemaRequest, resp *datasource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Lists all HookSniff endpoints.",
		Attributes: map[string]schema.Attribute{
			"endpoints": schema.ListNestedAttribute{
				Computed: true,
				NestedObject: schema.NestedAttributeObject{
					Attributes: map[string]schema.Attribute{
						"id":             schema.StringAttribute{Computed: true},
						"url":            schema.StringAttribute{Computed: true},
						"description":    schema.StringAttribute{Computed: true},
						"is_active":      schema.BoolAttribute{Computed: true},
						"created_at":     schema.StringAttribute{Computed: true},
						"failure_streak": schema.Int64Attribute{Computed: true},
					},
				},
			},
		},
	}
}

func (d *EndpointsDataSource) Configure(_ context.Context, req datasource.ConfigureRequest, resp *datasource.ConfigureResponse) {
	if req.ProviderData != nil {
		d.client = req.ProviderData.(*HookSniffClient)
	}
}

func (d *EndpointsDataSource) Read(ctx context.Context, req datasource.ReadRequest, resp *datasource.ReadResponse) {
	eps, err := d.client.ListEndpoints()
	if err != nil {
		resp.Diagnostics.AddError("Failed to list endpoints", err.Error())
		return
	}

	var config EndpointsDataSourceModel
	for _, ep := range eps {
		config.Endpoints = append(config.Endpoints, EndpointDataSourceModel{
			ID:            types.StringValue(ep.ID),
			URL:           types.StringValue(ep.URL),
			Description:   types.StringValue(ep.Description),
			IsActive:      types.BoolValue(ep.IsActive),
			CreatedAt:     types.StringValue(ep.CreatedAt.Format("2006-01-02T15:04:05Z")),
			FailureStreak: types.Int64Value(int64(ep.FailureStreak)),
		})
	}

	resp.Diagnostics.Append(resp.State.Set(ctx, &config)...)
}

// Placeholder resources (API Key, Schema, Event Type)
type APIKeyResource struct{ client *HookSniffClient }
type SchemaResource struct{ client *HookSniffClient }
type EventTypeResource struct{ client *HookSniffClient }

func NewAPIKeyResource() resource.Resource    { return &APIKeyResource{} }
func NewSchemaResource() resource.Resource    { return &SchemaResource{} }
func NewEventTypeResource() resource.Resource { return &EventTypeResource{} }

func (r *APIKeyResource) Metadata(_ context.Context, _ resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = "hooksniff_api_key"
}
func (r *APIKeyResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{ /* ... */ }
}
func (r *APIKeyResource) Configure(_ context.Context, _ resource.ConfigureRequest, _ *resource.ConfigureResponse) {}
func (r *APIKeyResource) Create(ctx context.Context, _ resource.CreateRequest, _ *resource.CreateResponse)       {}
func (r *APIKeyResource) Read(ctx context.Context, _ resource.ReadRequest, _ *resource.ReadResponse)              {}
func (r *APIKeyResource) Update(ctx context.Context, _ resource.UpdateRequest, _ *resource.UpdateResponse)        {}
func (r *APIKeyResource) Delete(ctx context.Context, _ resource.DeleteRequest, _ *resource.DeleteResponse)        {}

func (r *SchemaResource) Metadata(_ context.Context, _ resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = "hooksniff_schema"
}
func (r *SchemaResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{ /* ... */ }
}
func (r *SchemaResource) Configure(_ context.Context, _ resource.ConfigureRequest, _ *resource.ConfigureResponse) {}
func (r *SchemaResource) Create(ctx context.Context, _ resource.CreateRequest, _ *resource.CreateResponse)       {}
func (r *SchemaResource) Read(ctx context.Context, _ resource.ReadRequest, _ *resource.ReadResponse)              {}
func (r *SchemaResource) Update(ctx context.Context, _ resource.UpdateRequest, _ *resource.UpdateResponse)        {}
func (r *SchemaResource) Delete(ctx context.Context, _ resource.DeleteRequest, _ *resource.DeleteResponse)        {}

func (r *EventTypeResource) Metadata(_ context.Context, _ resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = "hooksniff_event_type"
}
func (r *EventTypeResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{ /* ... */ }
}
func (r *EventTypeResource) Configure(_ context.Context, _ resource.ConfigureRequest, _ *resource.ConfigureResponse) {}
func (r *EventTypeResource) Create(ctx context.Context, _ resource.CreateRequest, _ *resource.CreateResponse)       {}
func (r *EventTypeResource) Read(ctx context.Context, _ resource.ReadRequest, _ *resource.ReadResponse)              {}
func (r *EventTypeResource) Update(ctx context.Context, _ resource.UpdateRequest, _ *resource.UpdateResponse)        {}
func (r *EventTypeResource) Delete(ctx context.Context, _ resource.DeleteRequest, _ *resource.DeleteResponse)        {}
