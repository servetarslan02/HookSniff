use crate::error::AppError;

use super::PolarProvider;

impl PolarProvider {
    /// Update a Polar product's price via API.
    pub async fn update_product_price(
        &self,
        product_id: &str,
        price_cents: u64,
        currency: &str,
    ) -> Result<(), String> {
        if product_id.is_empty() {
            return Err("Product ID not configured".into());
        }

        let body = serde_json::json!({
            "prices": [{
                "price_type": "fixed",
                "price_amount": price_cents,
                "currency": currency.to_uppercase(),
            }]
        });

        let resp = self
            .client
            .patch(format!("{}/v1/products/{}", self.config.base_url, product_id))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Polar request failed: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("Polar API error ({}): {}", status, body));
        }

        Ok(())
    }

    /// Sync all plan prices to Polar (monthly + yearly).
    /// Called from admin settings update.
    pub async fn sync_prices_to_polar(
        &self,
        startup_price: f64,
        pro_price: f64,
        enterprise_price: f64,
    ) -> Vec<(String, Result<(), String>)> {
        let yearly_multiplier = 12.0 * 0.8; // 20% annual discount
        let plans = [
            // Monthly products
            ("startup_monthly", &self.config.product_startup, startup_price),
            ("pro_monthly", &self.config.product_pro, pro_price),
            ("enterprise_monthly", &self.config.product_business, enterprise_price),
            // Yearly products
            ("startup_yearly", &self.config.product_startup_yearly, (startup_price * yearly_multiplier).round()),
            ("pro_yearly", &self.config.product_pro_yearly, (pro_price * yearly_multiplier).round()),
            ("enterprise_yearly", &self.config.product_business_yearly, (enterprise_price * yearly_multiplier).round()),
        ];

        let mut results = Vec::new();
        for (name, product_id, price) in plans {
            if product_id.is_empty() {
                results.push((name.to_string(), Err("Product ID not configured".into())));
                continue;
            }
            let cents = (price * 100.0).round() as u64;
            let result = self.update_product_price(product_id, cents, "USD").await;
            results.push((name.to_string(), result));
        }
        results
    }
    /// Create a meter for webhook overage billing.
    /// Returns the meter ID. Idempotent — if meter already exists, returns existing ID.
    pub async fn ensure_overage_meter(&self) -> Result<String, String> {
        // First, check if meter already exists
        let list_resp = self
            .client
            .get(format!("{}/v1/meters/", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
            .send()
            .await
            .map_err(|e| format!("Polar meters list failed: {}", e))?;

        if list_resp.status().is_success() {
            #[derive(serde::Deserialize)]
            struct MeterItem {
                id: String,
                name: String,
            }
            #[derive(serde::Deserialize)]
            struct MetersResponse {
                items: Vec<MeterItem>,
            }
            if let Ok(data) = list_resp.json::<MetersResponse>().await {
                for item in data.items {
                    if item.name == "webhook_overage" {
                        return Ok(item.id);
                    }
                }
            }
        }

        // Create the meter
        let body = serde_json::json!({
            "name": "webhook_overage",
            "filter": {
                "conjunction": "and",
                "clauses": [{
                    "property": "name",
                    "operator": "eq",
                    "value": "webhook_overage"
                }]
            },
            "aggregation": {
                "func": "sum",
                "property": "overage_count"
            }
        });

        let resp = self
            .client
            .post(format!("{}/v1/meters/", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Polar meter creation failed: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("Polar API error ({}): {}", status, body));
        }

        #[derive(serde::Deserialize)]
        struct MeterResponse {
            id: String,
        }
        let data: MeterResponse = resp.json().await.map_err(|e| format!("Parse error: {}", e))?;
        Ok(data.id)
    }

    /// Ingest a webhook overage event to Polar for metered billing.
    /// Call this when a customer exceeds their daily limit.
    pub async fn ingest_overage_event(
        &self,
        customer_id: &str,
        overage_count: i64,
    ) -> Result<(), String> {
        if overage_count <= 0 {
            return Ok(());
        }

        let body = serde_json::json!({
            "events": [{
                "name": "webhook_overage",
                "external_customer_id": customer_id,
                "metadata": {
                    "overage_count": overage_count,
                    "source": "hooksniff",
                    "timestamp": chrono::Utc::now().to_rfc3339()
                }
            }]
        });

        let resp = self
            .client
            .post(format!("{}/v1/events/ingest", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Polar event ingest failed: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("Polar event ingest error ({}): {}", status, body));
        }

        Ok(())
    }
}

