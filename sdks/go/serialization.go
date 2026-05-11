// Serialization methods for resource-layer structs.
// Each struct gets ToJSON() map[string]interface{} and a static FromJSON() constructor.

package hooksniff

import (
	"encoding/json"
	"time"
)

// --- EndpointCreateInput ---

func (e *EndpointCreateInput) ToJSON() map[string]interface{} {
	m := map[string]interface{}{
		"url": e.URL,
	}
	if e.Description != "" {
		m["description"] = e.Description
	}
	if e.RateLimit != 0 {
		m["rate_limit"] = e.RateLimit
	}
	if e.Active != nil {
		m["active"] = *e.Active
	}
	return m
}

func EndpointCreateInputFromJSON(data map[string]interface{}) *EndpointCreateInput {
	e := &EndpointCreateInput{}
	if v, ok := data["url"].(string); ok {
		e.URL = v
	}
	if v, ok := data["description"].(string); ok {
		e.Description = v
	}
	if v, ok := data["rate_limit"]; ok {
		e.RateLimit = toInt(v)
	}
	if v, ok := data["active"].(bool); ok {
		e.Active = &v
	}
	return e
}

// --- EndpointUpdateInput ---

func (e *EndpointUpdateInput) ToJSON() map[string]interface{} {
	m := map[string]interface{}{}
	if e.URL != "" {
		m["url"] = e.URL
	}
	if e.Description != "" {
		m["description"] = e.Description
	}
	if e.RateLimit != 0 {
		m["rate_limit"] = e.RateLimit
	}
	if e.Active != nil {
		m["active"] = *e.Active
	}
	return m
}

func EndpointUpdateInputFromJSON(data map[string]interface{}) *EndpointUpdateInput {
	e := &EndpointUpdateInput{}
	if v, ok := data["url"].(string); ok {
		e.URL = v
	}
	if v, ok := data["description"].(string); ok {
		e.Description = v
	}
	if v, ok := data["rate_limit"]; ok {
		e.RateLimit = toInt(v)
	}
	if v, ok := data["active"].(bool); ok {
		e.Active = &v
	}
	return e
}

// --- EndpointOutput ---

func (e *EndpointOutput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"id":          e.ID,
		"url":         e.URL,
		"description": e.Description,
		"rate_limit":  e.RateLimit,
		"active":      e.Active,
		"created_at":  e.CreatedAt,
		"updated_at":  e.UpdatedAt,
	}
}

func EndpointOutputFromJSON(data map[string]interface{}) *EndpointOutput {
	e := &EndpointOutput{}
	if v, ok := data["id"].(string); ok {
		e.ID = v
	}
	if v, ok := data["url"].(string); ok {
		e.URL = v
	}
	if v, ok := data["description"].(string); ok {
		e.Description = v
	}
	if v, ok := data["rate_limit"]; ok {
		e.RateLimit = toInt(v)
	}
	if v, ok := data["active"].(bool); ok {
		e.Active = v
	}
	if v, ok := data["created_at"].(string); ok {
		e.CreatedAt = v
	}
	if v, ok := data["updated_at"].(string); ok {
		e.UpdatedAt = v
	}
	return e
}

// --- EndpointSecretOutput ---

func (e *EndpointSecretOutput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"key": e.Key,
	}
}

func EndpointSecretOutputFromJSON(data map[string]interface{}) *EndpointSecretOutput {
	e := &EndpointSecretOutput{}
	if v, ok := data["key"].(string); ok {
		e.Key = v
	}
	return e
}

// --- WebhookSendInput ---

func (w *WebhookSendInput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"endpoint_id": w.EndpointID,
		"event":       w.Event,
		"data":        w.Data,
	}
}

func WebhookSendInputFromJSON(data map[string]interface{}) *WebhookSendInput {
	w := &WebhookSendInput{}
	if v, ok := data["endpoint_id"].(string); ok {
		w.EndpointID = v
	}
	if v, ok := data["event"].(string); ok {
		w.Event = v
	}
	if v, ok := data["data"].(map[string]interface{}); ok {
		w.Data = v
	}
	return w
}

// --- WebhookBatchInput ---

func (w *WebhookBatchInput) ToJSON() map[string]interface{} {
	events := make([]interface{}, len(w.Events))
	for i, e := range w.Events {
		events[i] = e.ToJSON()
	}
	return map[string]interface{}{
		"endpoint_id": w.EndpointID,
		"events":      events,
	}
}

func WebhookBatchInputFromJSON(data map[string]interface{}) *WebhookBatchInput {
	w := &WebhookBatchInput{}
	if v, ok := data["endpoint_id"].(string); ok {
		w.EndpointID = v
	}
	if eventsRaw, ok := data["events"].([]interface{}); ok {
		events := make([]WebhookBatchEventInput, 0, len(eventsRaw))
		for _, er := range eventsRaw {
			if em, ok := er.(map[string]interface{}); ok {
				events = append(events, *WebhookBatchEventInputFromJSON(em))
			}
		}
		w.Events = events
	}
	return w
}

// --- WebhookBatchEventInput ---

func (w *WebhookBatchEventInput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"event": w.Event,
		"data":  w.Data,
	}
}

func WebhookBatchEventInputFromJSON(data map[string]interface{}) *WebhookBatchEventInput {
	w := &WebhookBatchEventInput{}
	if v, ok := data["event"].(string); ok {
		w.Event = v
	}
	if v, ok := data["data"].(map[string]interface{}); ok {
		w.Data = v
	}
	return w
}

// --- DeliveryOutput ---

func (d *DeliveryOutput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"id":            d.ID,
		"endpoint_id":   d.EndpointID,
		"event":         d.Event,
		"status":        d.Status,
		"response_code": d.ResponseCode,
		"response_body": d.ResponseBody,
		"created_at":    d.CreatedAt,
		"delivered_at":  d.DeliveredAt,
		"attempt_count": d.AttemptCount,
	}
}

func DeliveryOutputFromJSON(data map[string]interface{}) *DeliveryOutput {
	d := &DeliveryOutput{}
	if v, ok := data["id"].(string); ok {
		d.ID = v
	}
	if v, ok := data["endpoint_id"].(string); ok {
		d.EndpointID = v
	}
	if v, ok := data["event"].(string); ok {
		d.Event = v
	}
	if v, ok := data["status"].(string); ok {
		d.Status = v
	}
	if v, ok := data["response_code"]; ok {
		d.ResponseCode = toInt(v)
	}
	if v, ok := data["response_body"].(string); ok {
		d.ResponseBody = v
	}
	if v, ok := data["created_at"].(string); ok {
		d.CreatedAt = v
	}
	if v, ok := data["delivered_at"].(string); ok {
		d.DeliveredAt = v
	}
	if v, ok := data["attempt_count"]; ok {
		d.AttemptCount = toInt(v)
	}
	return d
}

// --- DeliveryListOutput ---

func (d *DeliveryListOutput) ToJSON() map[string]interface{} {
	data := make([]interface{}, len(d.Data))
	for i, item := range d.Data {
		data[i] = item.ToJSON()
	}
	return map[string]interface{}{
		"data":     data,
		"has_more": d.HasMore,
	}
}

func DeliveryListOutputFromJSON(jsonData map[string]interface{}) *DeliveryListOutput {
	d := &DeliveryListOutput{}
	if dataRaw, ok := jsonData["data"].([]interface{}); ok {
		items := make([]DeliveryOutput, 0, len(dataRaw))
		for _, itemRaw := range dataRaw {
			if itemMap, ok := itemRaw.(map[string]interface{}); ok {
				items = append(items, *DeliveryOutputFromJSON(itemMap))
			}
		}
		d.Data = items
	}
	if v, ok := jsonData["has_more"].(bool); ok {
		d.HasMore = v
	}
	return d
}

// --- BatchOutput ---

func (b *BatchOutput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"batch_id": b.BatchID,
		"count":    b.Count,
	}
}

func BatchOutputFromJSON(data map[string]interface{}) *BatchOutput {
	b := &BatchOutput{}
	if v, ok := data["batch_id"].(string); ok {
		b.BatchID = v
	}
	if v, ok := data["count"]; ok {
		b.Count = toInt(v)
	}
	return b
}

// --- RegisterInput ---

func (r *RegisterInput) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"email":    r.Email,
		"password": r.Password,
	}
}

func RegisterInputFromJSON(data map[string]interface{}) *RegisterInput {
	r := &RegisterInput{}
	if v, ok := data["email"].(string); ok {
		r.Email = v
	}
	if v, ok := data["password"].(string); ok {
		r.Password = v
	}
	return r
}

// --- LoginInput ---

func (l *LoginInput) ToJSON() map[string]interface{} {
	m := map[string]interface{}{
		"email":    l.Email,
		"password": l.Password,
	}
	if l.TOTPCode != "" {
		m["totp_code"] = l.TOTPCode
	}
	return m
}

func LoginInputFromJSON(data map[string]interface{}) *LoginInput {
	l := &LoginInput{}
	if v, ok := data["email"].(string); ok {
		l.Email = v
	}
	if v, ok := data["password"].(string); ok {
		l.Password = v
	}
	if v, ok := data["totp_code"].(string); ok {
		l.TOTPCode = v
	}
	return l
}

// --- AuthOutputWrapper ---

func (a *AuthOutputWrapper) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"token":    a.Token,
		"user_id":  a.UserID,
		"email":    a.Email,
		"plan":     a.Plan,
		"is_admin": a.IsAdmin,
	}
}

func AuthOutputWrapperFromJSON(data map[string]interface{}) *AuthOutputWrapper {
	a := &AuthOutputWrapper{}
	if v, ok := data["token"].(string); ok {
		a.Token = v
	}
	if v, ok := data["user_id"].(string); ok {
		a.UserID = v
	}
	if v, ok := data["email"].(string); ok {
		a.Email = v
	}
	if v, ok := data["plan"].(string); ok {
		a.Plan = v
	}
	if v, ok := data["is_admin"].(bool); ok {
		a.IsAdmin = v
	}
	return a
}

// --- ApiKeyCreateInputWrapper ---

func (a *ApiKeyCreateInputWrapper) ToJSON() map[string]interface{} {
	m := map[string]interface{}{
		"name": a.Name,
	}
	if a.ExpiresAt != "" {
		m["expires_at"] = a.ExpiresAt
	}
	return m
}

func ApiKeyCreateInputWrapperFromJSON(data map[string]interface{}) *ApiKeyCreateInputWrapper {
	a := &ApiKeyCreateInputWrapper{}
	if v, ok := data["name"].(string); ok {
		a.Name = v
	}
	if v, ok := data["expires_at"].(string); ok {
		a.ExpiresAt = v
	}
	return a
}

// --- PortalOutputWrapper ---

func (p *PortalOutputWrapper) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"url": p.URL,
	}
}

func PortalOutputWrapperFromJSON(data map[string]interface{}) *PortalOutputWrapper {
	p := &PortalOutputWrapper{}
	if v, ok := data["url"].(string); ok {
		p.URL = v
	}
	return p
}

// --- Helper: convert numeric JSON values to int ---

func toInt(v interface{}) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	case int32:
		return int(n)
	case int64:
		return int(n)
	case json.Number:
		i, _ := n.Int64()
		return int(i)
	default:
		return 0
	}
}

// --- Time serialization helpers ---

// TimeToJSON converts time.Time to RFC3339 string for JSON maps.
func TimeToJSON(t time.Time) string {
	return t.Format(time.RFC3339)
}

// TimeFromJSON parses an RFC3339 string from a JSON map value.
func TimeFromJSON(v interface{}) time.Time {
	s, ok := v.(string)
	if !ok {
		return time.Time{}
	}
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return time.Time{}
	}
	return t
}
