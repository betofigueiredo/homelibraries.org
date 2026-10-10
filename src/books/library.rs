//! Which library a public request is about: the `{username}` in the URL.

use std::collections::HashMap;

use axum::extract::{FromRequestParts, Path};
use axum::http::request::Parts;

use crate::{error::AppError, state::AppState, users::model::UserId};

/// Resolves the route's `{username}` to the library owner, or rejects with 404.
/// Usernames are stored lowercase, so `/Beto` and `/beto` are the same library.
pub struct Library(pub UserId);

impl FromRequestParts<AppState> for Library {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, AppError> {
        let Path(params) = Path::<HashMap<String, String>>::from_request_parts(parts, state)
            .await
            .map_err(|_| AppError::NotFound)?;
        let username = params.get("username").ok_or(AppError::NotFound)?;
        let user = state
            .users
            .find_by_username(&username.to_lowercase())
            .await?
            .ok_or(AppError::NotFound)?;
        Ok(Self(user.id))
    }
}
