package com.hooksniff.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeNotNull;

import com.hooksniff.HookSniff;
import com.hooksniff.HookSniffOptions;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.ApplicationIn;
import com.hooksniff.models.ApplicationOut;
import com.hooksniff.models.EndpointIn;
import com.hooksniff.models.EndpointOut;
import com.hooksniff.models.EndpointPatch;
import com.hooksniff.models.EventTypeIn;

import org.junit.Test;

import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class KitchenSinkTest {
    static final int HTTP_CONFLICT = 409;

    /**
     * Builds the client to use in the test cases based on env vars. If the env vars are not set,
     * the tests in this class are skipped (via the `assume*` calls.
     */
    public static HookSniff getTestClient() {
        String token = System.getenv("HOOKSNIFF_TOKEN");
        assumeNotNull(token);
        String serverUrl = System.getenv("HOOKSNIFF_SERVER_URL");
        assumeNotNull(serverUrl);
        HookSniffOptions opts = new HookSniffOptions();
        opts.setServerUrl(serverUrl);
        return new HookSniff(token, opts);
    }

    @Test
    public void testEndpointCRUD() throws Exception {
        HookSniff client = getTestClient();

        ApplicationIn appIn = new ApplicationIn();
        appIn.setName("test");

        ApplicationOut app = client.getApplication().create(appIn);
        assertEquals("test", app.getName());

        EventTypeIn et1 = new EventTypeIn();
        et1.setName("event.started");
        et1.setDescription("Something started");
        try {
            client.getEventType().create(et1);
        } catch (ApiException e) {
            assertEquals(HTTP_CONFLICT, e.getCode());
        }

        EventTypeIn et2 = new EventTypeIn();
        et2.setName("event.ended");
        et2.setDescription("Something ended");
        try {
            client.getEventType().create(et2);
        } catch (ApiException e) {
            assertEquals(HTTP_CONFLICT, e.getCode());
        }

        EndpointIn epIn = new EndpointIn();
        epIn.setUrl(new URI("https://example.hooksniff.com/"));
        EndpointOut ep1 = client.getEndpoint().create(app.getId(), epIn);

        EndpointPatch epPatched = new EndpointPatch();

        epPatched.setFilterTypes(Set.of("event.started", "event.ended"));

        EndpointOut ep2 = client.getEndpoint().patch(app.getId(), ep1.getId(), epPatched);

        assertEquals(
                ep2.getFilterTypes(), new HashSet<>(Arrays.asList("event.started", "event.ended")));

        assertEquals(
                ep2.getFilterTypes(), new HashSet<>(Arrays.asList("event.started", "event.ended")));

        // Should not throw an exception if the empty response body is handled correctly.
        client.getEndpoint().delete(app.getId(), ep1.getId());
    }
}
