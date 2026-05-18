// This file is @generated
package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonValue;
import com.hooksniff.Utils.ToQueryParam;

public enum Ordering implements ToQueryParam {
    ASCENDING("ascending"),
    DESCENDING("descending");
    private final String value;

    Ordering(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return this.value;
    }

    @Override
    public String toQueryParam() {
        return this.value;
    }
}
