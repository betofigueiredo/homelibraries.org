//! MCP (Model Context Protocol) server, so agents like Claude can use a library.
//! It is another input adapter next to the HTTP handlers: tools call the same services.
//! Every library has its own server at `/{username}/mcp`.

mod tools;

use std::sync::Arc;

use axum::{
    body::Body,
    extract::{Request, State},
    response::Response,
};
use rmcp::transport::streamable_http_server::{
    StreamableHttpServerConfig, StreamableHttpService, session::local::LocalSessionManager,
};
pub use tools::LibraryMcp;
use tower::ServiceExt;

use crate::{books::library::Library, state::AppState, users::model::UserId};

/// `/{username}/mcp`: finds the library (404 if there is no such user) and hands the request
/// to an MCP server for it. The server is stateless with plain JSON responses: every tool call
/// is one request/response, so building one per request costs nothing and needs no sessions.
pub async fn handler(
    Library(owner): Library,
    State(state): State<AppState>,
    request: Request,
) -> Response {
    let Ok(response) = service(state, owner).oneshot(request).await;
    response.map(Body::new)
}

/// rmcp only accepts requests whose `Host` is in `allowed_hosts` (protection against DNS
/// rebinding). Behind nginx the `Host` is the public domain, taken from `public_url`.
fn service(
    state: AppState,
    owner: UserId,
) -> StreamableHttpService<LibraryMcp, LocalSessionManager> {
    let mut allowed_hosts = vec!["localhost".to_owned(), "127.0.0.1".to_owned()];
    if let Some(host) = public_host(&state.public_url) {
        allowed_hosts.push(host.to_owned());
        if let Some((name, _port)) = host.split_once(':') {
            allowed_hosts.push(name.to_owned());
        }
    }
    let config = StreamableHttpServerConfig::default()
        .with_legacy_session_mode(false)
        .with_json_response(true)
        .with_allowed_hosts(allowed_hosts);
    StreamableHttpService::new(
        move || Ok(LibraryMcp::new(state.clone(), owner)),
        Arc::default(),
        config,
    )
}

/// `https://homelibraries.org` -> `homelibraries.org`.
fn public_host(public_url: &str) -> Option<&str> {
    let rest = public_url.split_once("://")?.1;
    rest.split('/').next().filter(|host| !host.is_empty())
}
