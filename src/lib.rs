pub mod auth;
pub mod books;
pub mod error;
mod health;
pub mod mailer;
pub mod mcp;
pub mod rate_limit;
pub mod state;
pub mod users;
mod web;

use std::time::Duration;

use axum::{Router, http::StatusCode, routing::any};
use state::AppState;
use tower_http::{
    request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer},
    timeout::TimeoutLayer,
    trace::TraceLayer,
};

/// Builds the application router. Kept separate from `main` so tests can use it directly.
pub fn app(state: AppState) -> Router {
    // Everything anyone can reach without signing in, rate limited per client IP.
    let public = Router::new()
        .merge(users::public_router())
        .merge(books::read_router())
        .route("/{username}/mcp", any(mcp::handler));

    // Signed-in routes: the session cookie is the limit, not the IP.
    let private = Router::new()
        .merge(users::private_router())
        .merge(books::write_router());

    Router::new()
        .merge(health::router())
        .merge(rate_limit::per_ip(public))
        .merge(private)
        // Everything else is a page of the React app.
        .fallback(web::handler)
        .with_state(state)
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(10),
        ))
        .layer(PropagateRequestIdLayer::x_request_id())
        .layer(TraceLayer::new_for_http())
        .layer(SetRequestIdLayer::x_request_id(MakeRequestUuid))
}
