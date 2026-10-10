mod common;

use axum::{
    body::Body,
    http::{Method, Request, StatusCode, header},
};
use serde_json::{Value, json};

#[tokio::test]
async fn sign_in_by_email_link_creates_the_account() {
    let app = common::app();

    let reply = app
        .send(
            Method::POST,
            "/api/auth/link",
            Some(json!({ "email": " Ada@Mail.com " })),
            None,
        )
        .await;
    assert_eq!(reply.status, StatusCode::ACCEPTED);
    let link = app.mailer.last_link_to("ada@mail.com").unwrap();
    assert!(link.starts_with("http://localhost:3000/signin/verify?token="));

    let token = link.split_once("token=").unwrap().1;
    let reply = app
        .send(
            Method::POST,
            "/api/auth/verify",
            Some(json!({ "token": token })),
            None,
        )
        .await;
    assert_eq!(reply.status, StatusCode::OK);
    assert_eq!(reply.body["email"], "ada@mail.com");
    assert_eq!(reply.body["username"], Value::Null);
    let set_cookie = reply.headers[header::SET_COOKIE].to_str().unwrap();
    assert!(set_cookie.starts_with("session="));
    assert!(set_cookie.contains("HttpOnly"));

    let cookie = set_cookie.split(';').next().unwrap();
    let me = app.send(Method::GET, "/api/me", None, Some(cookie)).await;
    assert_eq!(me.status, StatusCode::OK);
    assert_eq!(me.body["email"], "ada@mail.com");
}

#[tokio::test]
async fn signing_in_again_finds_the_same_account() {
    let app = common::app();
    let first = app.sign_up("ada@mail.com", "ada").await;
    let second = app.sign_in("ada@mail.com").await;

    assert_ne!(first, second);
    let me = app.send(Method::GET, "/api/me", None, Some(&second)).await;
    assert_eq!(me.body["username"], "ada");
}

#[tokio::test]
async fn a_sign_in_link_works_once() {
    let app = common::app();
    app.send(
        Method::POST,
        "/api/auth/link",
        Some(json!({ "email": "ada@mail.com" })),
        None,
    )
    .await;
    let link = app.mailer.last_link_to("ada@mail.com").unwrap();
    let token = link.split_once("token=").unwrap().1;

    let verify = || {
        app.send(
            Method::POST,
            "/api/auth/verify",
            Some(json!({ "token": token })),
            None,
        )
    };
    assert_eq!(verify().await.status, StatusCode::OK);
    assert_eq!(verify().await.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn bad_emails_get_no_link() {
    let app = common::app();
    for email in ["", "ada", "ada@mail"] {
        let reply = app
            .send(
                Method::POST,
                "/api/auth/link",
                Some(json!({ "email": email })),
                None,
            )
            .await;
        assert_eq!(reply.status, StatusCode::BAD_REQUEST, "{email}");
    }
}

#[tokio::test]
async fn me_needs_a_session() {
    let app = common::app();
    for cookie in [None, Some("session=made-up")] {
        let reply = app.send(Method::GET, "/api/me", None, cookie).await;
        assert_eq!(reply.status, StatusCode::UNAUTHORIZED);
    }
}

#[tokio::test]
async fn usernames_are_validated_and_unique() {
    let app = common::app();
    app.sign_up("ada@mail.com", "ada").await;
    let grace = app.sign_in("grace@mail.com").await;

    let set = |username: &'static str| {
        app.send(
            Method::PATCH,
            "/api/me",
            Some(json!({ "username": username })),
            Some(&grace),
        )
    };
    assert_eq!(set("ada").await.status, StatusCode::CONFLICT);
    assert_eq!(set("api").await.status, StatusCode::CONFLICT);
    assert_eq!(set("no spaces").await.status, StatusCode::BAD_REQUEST);

    let reply = set("Grace").await;
    assert_eq!(reply.status, StatusCode::OK);
    assert_eq!(reply.body["username"], "grace");
}

#[tokio::test]
async fn logout_ends_the_session() {
    let app = common::app();
    let cookie = app.sign_in("ada@mail.com").await;

    let reply = app
        .send(Method::POST, "/api/auth/logout", None, Some(&cookie))
        .await;
    assert_eq!(reply.status, StatusCode::NO_CONTENT);
    let cleared = reply.headers[header::SET_COOKIE].to_str().unwrap();
    assert!(cleared.contains("Max-Age=0"));

    let me = app.send(Method::GET, "/api/me", None, Some(&cookie)).await;
    assert_eq!(me.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn other_websites_cannot_make_changes() {
    let app = common::app();
    let cookie = app.sign_in("ada@mail.com").await;

    let patch = |origin: &str| {
        Request::patch("/api/me")
            .header(header::COOKIE, &cookie)
            .header(header::ORIGIN, origin)
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(json!({ "username": "ada" }).to_string()))
            .unwrap()
    };
    assert_eq!(
        app.read(patch("https://evil.example")).await.status,
        StatusCode::FORBIDDEN
    );
    assert_eq!(
        app.read(patch("http://localhost:3000")).await.status,
        StatusCode::OK
    );
}
