mod common;

use api::rate_limit::BURST;
use axum::{
    body::Body,
    http::{Request, StatusCode, header},
};
use common::TestApp;
use serde_json::json;

/// A public read as nginx forwards it, from the client at `ip`.
async fn read_from(app: &TestApp, ip: &str) -> StatusCode {
    let request = Request::get("/api/libraries/ada/books")
        .header("x-real-ip", ip)
        .body(Body::empty())
        .unwrap();
    app.read(request).await.status
}

#[tokio::test]
async fn reads_are_limited_per_ip() {
    let app = common::app();
    app.sign_up("ada@mail.com", "ada").await;

    for _ in 0..BURST {
        assert_eq!(read_from(&app, "203.0.113.1").await, StatusCode::OK);
    }
    assert_eq!(
        read_from(&app, "203.0.113.1").await,
        StatusCode::TOO_MANY_REQUESTS
    );

    // Another client has its own bucket.
    assert_eq!(read_from(&app, "203.0.113.2").await, StatusCode::OK);
}

#[tokio::test]
async fn mcp_and_sign_in_are_limited_but_signed_in_routes_are_not() {
    let app = common::app();
    // Requests without `x-real-ip` land in the 127.0.0.1 bucket; sign up before using it up.
    let cookie = app.sign_up("ada@mail.com", "ada").await;
    for _ in 0..BURST {
        read_from(&app, "127.0.0.1").await;
    }

    let mcp = Request::post("/ada/mcp")
        .header(header::HOST, "localhost")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::ACCEPT, "application/json, text/event-stream")
        .body(Body::from(
            json!({ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }).to_string(),
        ))
        .unwrap();
    assert_eq!(app.read(mcp).await.status, StatusCode::TOO_MANY_REQUESTS);

    let link = Request::post("/api/auth/link")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(json!({ "email": "grace@mail.com" }).to_string()))
        .unwrap();
    assert_eq!(app.read(link).await.status, StatusCode::TOO_MANY_REQUESTS);

    // The same client, signed in: limited by the session instead.
    let (status, _) = app.import(common::FIXTURE, Some(&cookie)).await;
    assert_eq!(status, StatusCode::OK);
}
