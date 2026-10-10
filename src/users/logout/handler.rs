use axum::{
    extract::State,
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};

use super::service::LogoutService;
use crate::{
    auth::{CurrentUser, clear_session_cookie},
    error::AppError,
    state::AppState,
};

pub async fn handler(
    current: CurrentUser,
    State(state): State<AppState>,
) -> Result<Response, AppError> {
    LogoutService::new(state.sessions.clone())
        .execute(&current.session_hash)
        .await?;
    let cookie = clear_session_cookie(&state);
    Ok((StatusCode::NO_CONTENT, [(header::SET_COOKIE, cookie)]).into_response())
}
