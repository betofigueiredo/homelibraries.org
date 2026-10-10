mod common;

use axum::http::{Method, StatusCode};

#[tokio::test]
async fn unknown_api_routes_are_json_404s_not_the_app() {
    let app = common::app();

    let (status, body) = app.get("/api/nope").await;

    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["error"], "resource not found");
}

#[tokio::test]
async fn missing_assets_and_non_get_requests_are_404s() {
    let app = common::app();

    let (status, _) = app.get("/assets/missing-1234.js").await;
    assert_eq!(status, StatusCode::NOT_FOUND);

    let reply = app.send(Method::POST, "/ada", None, None).await;
    assert_eq!(reply.status, StatusCode::NOT_FOUND);
}
