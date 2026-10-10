// Each test file uses a different subset of these helpers.
#![allow(dead_code)]

use std::sync::Arc;

use api::{mailer::LogMailer, state::AppState};
use axum::{
    Router,
    body::Body,
    http::{HeaderMap, Method, Request, StatusCode, header},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use tower::ServiceExt;

/// The Goodreads export used by the tests:
/// Dune (read, owned), Neuromancer (currently reading, not owned), Animal Farm (to-read, so
/// ignored), plus one read row with no title that gets skipped.
pub const FIXTURE: &str = include_str!("../fixtures/goodreads.csv");

/// The Hardcover export used by the tests: 3 read and 2 currently-reading books.
pub const HARDCOVER_FIXTURE: &str = include_str!("../fixtures/hardcover.csv");

/// The app with in-memory storage, and the mailer that "sends" its sign-in links.
/// `Router` is cheap to clone and clones share state, so send many requests to one app.
pub struct TestApp {
    pub router: Router,
    pub mailer: Arc<LogMailer>,
}

pub struct Reply {
    pub status: StatusCode,
    /// Parsed JSON body, `Null` if empty.
    pub body: Value,
    pub headers: HeaderMap,
}

pub fn app() -> TestApp {
    let mailer = Arc::new(LogMailer::default());
    let state = AppState::in_memory().with_mailer(mailer.clone());
    TestApp {
        router: api::app(state),
        mailer,
    }
}

impl TestApp {
    /// One JSON request, as `cookie` (`session=...`) if given.
    pub async fn send(
        &self,
        method: Method,
        uri: &str,
        body: Option<Value>,
        cookie: Option<&str>,
    ) -> Reply {
        let mut request = Request::builder().method(method).uri(uri);
        if let Some(cookie) = cookie {
            request = request.header(header::COOKIE, cookie);
        }
        let request = match body {
            Some(json) => request
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(json.to_string())),
            None => request.body(Body::empty()),
        }
        .unwrap();
        self.read(request).await
    }

    /// A public GET; returns the status and JSON body.
    pub async fn get(&self, uri: &str) -> (StatusCode, Value) {
        let reply = self.send(Method::GET, uri, None, None).await;
        (reply.status, reply.body)
    }

    /// Asks for a sign-in link, follows it, and returns the session cookie (`session=...`).
    pub async fn sign_in(&self, email: &str) -> String {
        let reply = self
            .send(
                Method::POST,
                "/api/auth/link",
                Some(json!({ "email": email })),
                None,
            )
            .await;
        assert_eq!(reply.status, StatusCode::ACCEPTED);
        let link = self
            .mailer
            .last_link_to(email)
            .expect("a sign-in link was sent");
        let token = link.split_once("token=").unwrap().1;

        let reply = self
            .send(
                Method::POST,
                "/api/auth/verify",
                Some(json!({ "token": token })),
                None,
            )
            .await;
        assert_eq!(reply.status, StatusCode::OK, "{}", reply.body);
        let set_cookie = reply.headers[header::SET_COOKIE].to_str().unwrap();
        set_cookie.split(';').next().unwrap().to_owned()
    }

    /// Signs in and picks a username, so the library is at `/api/libraries/{username}`.
    pub async fn sign_up(&self, email: &str, username: &str) -> String {
        let cookie = self.sign_in(email).await;
        let reply = self
            .send(
                Method::PATCH,
                "/api/me",
                Some(json!({ "username": username })),
                Some(&cookie),
            )
            .await;
        assert_eq!(reply.status, StatusCode::OK, "{}", reply.body);
        cookie
    }

    /// Uploads `csv` to the import as the form field `file`, like `curl -F file=@...`.
    pub async fn import(&self, csv: &str, cookie: Option<&str>) -> (StatusCode, Value) {
        self.upload("/api/me/import", csv, cookie).await
    }

    /// Uploads `csv` to the import preview, which writes nothing.
    pub async fn preview(&self, csv: &str, cookie: Option<&str>) -> (StatusCode, Value) {
        self.upload("/api/me/import/preview", csv, cookie).await
    }

    async fn upload(&self, uri: &str, csv: &str, cookie: Option<&str>) -> (StatusCode, Value) {
        const BOUNDARY: &str = "test-boundary";
        let body = format!(
            "--{BOUNDARY}\r\n\
             Content-Disposition: form-data; name=\"file\"; filename=\"export.csv\"\r\n\
             Content-Type: text/csv\r\n\r\n\
             {csv}\r\n\
             --{BOUNDARY}--\r\n"
        );
        let mut request = Request::post(uri).header(
            header::CONTENT_TYPE,
            format!("multipart/form-data; boundary={BOUNDARY}"),
        );
        if let Some(cookie) = cookie {
            request = request.header(header::COOKIE, cookie);
        }
        let reply = self.read(request.body(Body::from(body)).unwrap()).await;
        (reply.status, reply.body)
    }

    pub async fn read(&self, request: Request<Body>) -> Reply {
        let response = self.router.clone().oneshot(request).await.unwrap();
        let status = response.status();
        let headers = response.headers().clone();
        let bytes = response.into_body().collect().await.unwrap().to_bytes();
        let body = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
        Reply {
            status,
            body,
            headers,
        }
    }
}
