// This file is @generated
package com.hooksniff.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.hooksniff.Utils;

import lombok.EqualsAndHashCode;
import lombok.ToString;

@ToString
@EqualsAndHashCode
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonAutoDetect(getterVisibility = Visibility.NONE, setterVisibility = Visibility.NONE)
public class HookSniffConfigOut {
    public HookSniffConfigOut() {}

    /**
     * Create an instance of HookSniffConfigOut given an JSON string
     *
     * @param jsonString JSON string
     * @return An instance of HookSniffConfigOut
     * @throws JsonProcessingException if the JSON string is invalid with respect to HookSniffConfigOut
     */
    public static HookSniffConfigOut fromJson(String jsonString) throws JsonProcessingException {
        return Utils.getObjectMapper().readValue(jsonString, HookSniffConfigOut.class);
    }

    /**
     * Convert an instance of HookSniffConfigOut to an JSON string
     *
     * @return JSON string
     */
    public String toJson() throws JsonProcessingException {
        return Utils.getObjectMapper().writeValueAsString(this);
    }
}
