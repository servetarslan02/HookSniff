// this file is @generated
package com.hooksniff.api;

import com.hooksniff.models.Ordering;

import lombok.Data;

@Data
public class EndpointListOptions {
    /** Limit the number of returned items */
    Long limit;

    /** The iterator returned from a prior invocation */
    String iterator;

    /** The sorting order of the returned items */
    Ordering order;
}
