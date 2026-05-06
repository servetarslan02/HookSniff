package com.hooksniff;

import com.google.gson.JsonObject;
import java.util.List;

/**
 * Result of a batch webhook send.
 */
public class BatchResult {
    private List<Delivery> deliveries;
    private List<JsonObject> errors;

    public List<Delivery> getDeliveries() { return deliveries; }
    public void setDeliveries(List<Delivery> deliveries) { this.deliveries = deliveries; }
    public List<JsonObject> getErrors() { return errors; }
    public void setErrors(List<JsonObject> errors) { this.errors = errors; }
}
