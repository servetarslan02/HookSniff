package main

import (
	"context"
	"fmt"

	"github.com/hashicorp/terraform-plugin-framework/path"
	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

var _ resource.Resource = &EndpointResource{}
var _ resource.ResourceWithImportState = &EndpointResource{}

type EndpointResource struct {
	client *HookSniffClient
}

type EndpointResourceModel struct {
	ID            types.String `tfsdk:"id"`
	URL           types.String `tfsdk:"url"`
	Description   types.String `tfsdk:"description"`
	IsActive      types.Bool   `tfsdk:"is_active"`
	CreatedAt     types.String `tfsdk:"created_at"`
	FailureStreak types.Int64  `tfsdk:"failure_streak"`
}

func NewEndpointResource() resource.Resource {
	return &EndpointResource{}
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
				Description: "The URL to deliver webhooks to.",
				Required:    true,
			},
			"description": schema.StringAttribute{
				Description: "Human-readable description of the endpoint.",
				Optional:    true,
			},
			"is_active": schema.BoolAttribute{
				Description: "Whether the endpoint is active.",
				Optional:    true,
				Computed:    true,
			},
			"created_at": schema.StringAttribute{
				Description: "When the endpoint was created.",
				Computed:    true,
			},
			"failure_streak": schema.Int64Attribute{
				Description: "Current consecutive failure count.",
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
			fmt.Sprintf("Expected *HookSniffClient, got: %T.", req.ProviderData),
		)
		return
	}
	r.client = client
}

func (r *EndpointResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
	var plan EndpointResourceModel
	resp.Diagnostics.Append(req.Plan.Get(ctx, &plan)...)
	if resp.Diagnostics.HasError() {
		return
	}

	endpoint, err := r.client.CreateEndpoint(CreateEndpointRequest{
		URL:         plan.URL.ValueString(),
		Description: plan.Description.ValueString(),
	})
	if err != nil {
		resp.Diagnostics.AddError("Failed to create endpoint", err.Error())
		return
	}

	plan.ID = types.StringValue(endpoint.ID)
	plan.URL = types.StringValue(endpoint.URL)
	plan.Description = types.StringValue(endpoint.Description)
	plan.IsActive = types.BoolValue(endpoint.IsActive)
	plan.CreatedAt = types.StringValue(endpoint.CreatedAt.Format("2006-01-02T15:04:05Z"))
	plan.FailureStreak = types.Int64Value(int64(endpoint.FailureStreak))

	resp.Diagnostics.Append(resp.State.Set(ctx, &plan)...)
}

func (r *EndpointResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
	var state EndpointResourceModel
	resp.Diagnostics.Append(req.State.Get(ctx, &state)...)
	if resp.Diagnostics.HasError() {
		return
	}

	endpoint, err := r.client.GetEndpoint(state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Failed to read endpoint", err.Error())
		return
	}

	state.URL = types.StringValue(endpoint.URL)
	state.Description = types.StringValue(endpoint.Description)
	state.IsActive = types.BoolValue(endpoint.IsActive)
	state.CreatedAt = types.StringValue(endpoint.CreatedAt.Format("2006-01-02T15:04:05Z"))
	state.FailureStreak = types.Int64Value(int64(endpoint.FailureStreak))

	resp.Diagnostics.Append(resp.State.Set(ctx, &state)...)
}

func (r *EndpointResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
	var plan EndpointResourceModel
	resp.Diagnostics.Append(req.Plan.Get(ctx, &plan)...)
	if resp.Diagnostics.HasError() {
		return
	}

	endpoint, err := r.client.UpdateEndpoint(plan.ID.ValueString(), CreateEndpointRequest{
		URL:         plan.URL.ValueString(),
		Description: plan.Description.ValueString(),
	})
	if err != nil {
		resp.Diagnostics.AddError("Failed to update endpoint", err.Error())
		return
	}

	plan.URL = types.StringValue(endpoint.URL)
	plan.Description = types.StringValue(endpoint.Description)
	plan.IsActive = types.BoolValue(endpoint.IsActive)
	plan.CreatedAt = types.StringValue(endpoint.CreatedAt.Format("2006-01-02T15:04:05Z"))
	plan.FailureStreak = types.Int64Value(int64(endpoint.FailureStreak))

	resp.Diagnostics.Append(resp.State.Set(ctx, &plan)...)
}

func (r *EndpointResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
	var state EndpointResourceModel
	resp.Diagnostics.Append(req.State.Get(ctx, &state)...)
	if resp.Diagnostics.HasError() {
		return
	}

	if err := r.client.DeleteEndpoint(state.ID.ValueString()); err != nil {
		resp.Diagnostics.AddError("Failed to delete endpoint", err.Error())
		return
	}
}

func (r *EndpointResource) ImportState(ctx context.Context, req resource.ImportStateRequest, resp *resource.ImportStateResponse) {
	resource.ImportStatePassthroughID(ctx, path.Root("id"), req, resp)
}
