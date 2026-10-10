//! The signed-in user. `CurrentUser` already loaded it, so there is no service.

use axum::Json;

use crate::{auth::CurrentUser, users::model::User};

pub async fn handler(current: CurrentUser) -> Json<User> {
    Json(current.user)
}
