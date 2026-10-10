//! Users domain: accounts, sign-in links and sessions. Depends on no other domain.

mod get_library;
mod get_me;
mod logout;
pub mod model;
pub mod repository;
mod request_login_link;
pub mod secret;
mod update_me;
mod verify_login;

use axum::{
    Router,
    routing::{get, post},
};

use crate::state::AppState;

/// Routes anyone can call. `app` puts the rate limit on these, so links can't be spammed
/// and tokens can't be guessed.
pub fn public_router() -> Router<AppState> {
    Router::new()
        .route("/api/auth/link", post(request_login_link::handler))
        .route("/api/auth/verify", post(verify_login::handler))
        .route("/api/libraries/{username}", get(get_library::handler))
}

/// Routes for the signed-in user: each handler takes `CurrentUser`.
pub fn private_router() -> Router<AppState> {
    Router::new()
        .route("/api/auth/logout", post(logout::handler))
        .route("/api/me", get(get_me::handler).patch(update_me::handler))
}
