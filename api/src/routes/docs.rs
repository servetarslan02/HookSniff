use axum::response::Html;

const SWAGGER_UI_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HookSniff API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css">
    <style>
        body { margin: 0; padding: 0; }
        .topbar { display: none; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: '/v1/openapi.yaml',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            docExpansion: "list",
            filter: true,
        });
    </script>
</body>
</html>"#;

const OPENAPI_SPEC: &str = include_str!("../../../docs/openapi.yaml");

pub async fn swagger_ui() -> Html<&'static str> {
    Html(SWAGGER_UI_HTML)
}

pub async fn openapi_spec() -> (
    axum::http::StatusCode,
    axum::http::HeaderMap,
    &'static str,
) {
    let mut headers = axum::http::HeaderMap::new();
    headers.insert(
        axum::http::header::CONTENT_TYPE,
        axum::http::HeaderValue::from_static("application/yaml"),
    );
    headers.insert(
        axum::http::header::CACHE_CONTROL,
        axum::http::HeaderValue::from_static("public, max-age=3600"),
    );
    (axum::http::StatusCode::OK, headers, OPENAPI_SPEC)
}
