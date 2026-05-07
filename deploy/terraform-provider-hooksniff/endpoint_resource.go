package main

import (
	"context"
	"fmt"

	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

// Ensure provider defined types fully satisfy framework interfaces.
var _ resource.Resource = &EndpointResource{}

func NewEndpointResource() resource.Resource {
	return &EndpointResource{}
}

// EndpointResource manages a webhook endpoint.
type EndpointResource struct {
	client *HookSniffClient
}

// EndpointResourceModel describes the resource data model.
type EndpointResourceModel struct {
	ID              types.String `tfsdk:"id"`
	URL             types.String `tfsdk:"url"`
	Description     types.String `tfsdk:"description"`
	IsActive        types.Bool   `tfsdk:"is_active"`
	SigningSecret   types.String `tfsdk:"signing_secret"`
	RoutingStrategy types.String `tfsdk:"routing_strategy"`
	FallbackURL     types.String `tfsdk:"fallback_url"`
	CreatedAt       types.String `tfsdk:"created_at"`
}

func (r *EndpointResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
	resp.TypeName = req.ProviderTypeName + "_endpoint"
}

func (r *EndpointResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
	resp.Schema = schema.Schema{
		Description: "Manages a HookSniff webhook endpoint.",
		Attributes: map[string]schema.Attribute{
			"id": schema.StringAttribute{
				Description: "Endpoint identifier.",
				Computed:    true,
			},
			"url": schema.StringAttribute{
				Description: "Target URL for webhook delivery.",
				Required:    true,
			},
			"description": schema.StringAttribute{
				Description: "Endpoint description.",
				Optional:    true,
			},
			"is_active": schema.BoolAttribute{
				Description: "Whether the endpoint is active.",
				Computed:    true,
			},
			"signing_secret": schema.StringAttribute{
				Description: "HMAC signing secret for webhook verification.",
				Computed:    true,
				Sensitive:   true,
			},
			"routing_strategy": schema.StringAttribute{
				Description: "Routing strategy: round-robin, latency, or failover.",
				Optional:    true,
			},
			"fallback_url": schema.StringAttribute{
				Description: "Fallback URL for failover routing.",
				Optional:    true,
			},
			"created_at": schema.StringAttribute{
				Description: "Creation timestamp.",
				Computed:    true,
			},
		},
	}
}

func (r *EndpointResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
	if req.ProviderData == nil {
		return
	}

	client, ok := req.ProviderData.(*HookSniffClient)
	if !ok {
		resp.Diagnostics.AddError(
			"Unexpected Resource Configure Type",
			fmt.Sprintf("Expected *HookSniffClient, got: %T", req.ProviderData),
		)
		return
	}
	r.client = client
}

func (r *EndpointResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan EndpointResourceModel
	diags := req.Plan.Get(ctx, &plan)
	resp.Diagnostics.Append(diags...)
	if resp.Diagnostics.HasError() {
		return
	}

	// TODO: Call HookSniff API to create endpoint
	// POST /v1/endpoints { url, description, routing_strategy, fallback_url }

	resp.Diagnostics.AddWarning(
		"Not Implemented",
		"Terraform provider is a documentation stub. API calls not yet implemented.",
	)
}

func (r *EndpointResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	// TODO: Call HookSniff API to read endpoint
	// GET /v1/endpoints/{id}
}

func (r *EndpointResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	// TODO: Call HookSniff API to update endpoint
	// PUT /v1/endpoints/{id}
}

func (r *EndpointResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	// TODO: Call HookSniff API to delete endpoint
	// DELETE /v1/endpoints/{id}
}
