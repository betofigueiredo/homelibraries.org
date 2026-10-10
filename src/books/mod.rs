//! Books domain: each user's library. A link domain: depends on `users` (every book belongs
//! to one user, and public routes find the library by username).

pub(crate) mod get_book;
mod import_library;
pub(crate) mod library;
pub(crate) mod library_stats;
pub mod model;
pub mod repository;
pub(crate) mod search_books;

use axum::{
    Router,
    routing::{get, post},
};

use crate::state::AppState;

/// Public routes: anyone can read any library. `app` puts the rate limit on these.
pub fn read_router() -> Router<AppState> {
    Router::new()
        .route(
            "/api/libraries/{username}/books",
            get(search_books::handler),
        )
        .route(
            "/api/libraries/{username}/books/{id}",
            get(get_book::handler),
        )
        .route(
            "/api/libraries/{username}/stats",
            get(library_stats::handler),
        )
}

/// Routes for the signed-in user: each handler takes `CurrentUser`.
/// All changes come from imports; there's no endpoint to add or edit a book by hand.
pub fn write_router() -> Router<AppState> {
    Router::new()
        .route("/api/me/import", post(import_library::handler))
        .route("/api/me/import/preview", post(import_library::preview))
}
