use std::sync::{Arc, Mutex};

use api::{
    error::AppError,
    mailer::{Mailer, ResendMailer},
};
use axum::{
    Json, Router,
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::post,
};
use serde_json::{Value, json};
use tokio::net::TcpListener;

/// What the fake Resend received: the `Authorization` header and the JSON body.
type Received = Arc<Mutex<Vec<(String, Value)>>>;

/// Starts a fake Resend on a free port that answers every email with `status`.
async fn fake_resend(status: StatusCode) -> (String, Received) {
    let received = Received::default();
    let app = Router::new()
        .route(
            "/emails",
            post(
                move |State(received): State<Received>, headers: HeaderMap, Json(body): Json<Value>| async move {
                    let auth = headers["authorization"].to_str().unwrap().to_owned();
                    received.lock().unwrap().push((auth, body));
                    let answer = if status.is_success() {
                        json!({"id": "4ef9a417-02e9-4d39-ad75-9611e0fcc33c"})
                    } else {
                        json!({"name": "validation_error", "message": "The domain is not verified."})
                    };
                    (status, Json(answer))
                },
            ),
        )
        .with_state(received.clone());
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/emails", listener.local_addr().unwrap());
    tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
    (url, received)
}

const LINK: &str = "https://homelibraries.org/signin/verify?token=abc123";

#[tokio::test]
async fn sends_the_link_through_resend() {
    let (url, received) = fake_resend(StatusCode::OK).await;
    let mailer = ResendMailer::new("re_test", "Home Libraries <hello@homelibraries.org>")
        .unwrap()
        .with_endpoint(&url);

    mailer.send_login_link("ada@mail.com", LINK).await.unwrap();

    let received = received.lock().unwrap();
    let (auth, email) = &received[0];
    assert_eq!(auth, "Bearer re_test");
    assert_eq!(email["from"], "Home Libraries <hello@homelibraries.org>");
    assert_eq!(email["to"], json!(["ada@mail.com"]));
    assert_eq!(email["subject"], "Your sign-in link");
    assert!(email["text"].as_str().unwrap().contains(LINK));
    assert!(
        email["html"]
            .as_str()
            .unwrap()
            .contains(&format!(r#"href="{LINK}""#))
    );
}

#[tokio::test]
async fn a_refused_email_is_an_error_with_resends_reason() {
    let (url, _) = fake_resend(StatusCode::UNPROCESSABLE_ENTITY).await;
    let mailer = ResendMailer::new("re_test", "hello@homelibraries.org")
        .unwrap()
        .with_endpoint(&url);

    let error = mailer
        .send_login_link("ada@mail.com", LINK)
        .await
        .unwrap_err();

    let AppError::Internal(message) = error else {
        panic!("expected an internal error, got {error:?}");
    };
    assert!(message.contains("422"), "{message}");
    assert!(message.contains("not verified"), "{message}");
}

#[test]
fn mail_from_needs_an_address() {
    assert!(ResendMailer::new("re_test", "Home Libraries").is_err());
}
