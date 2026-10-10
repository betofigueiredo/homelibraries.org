use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

/// Application-wide error type. Handlers return `Result<T, AppError>`.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("resource not found")]
    NotFound,

    #[error("bad request: {0}")]
    BadRequest(String),

    #[error("sign in first: the link or session is invalid or expired")]
    Unauthorized,

    #[error("request from another website")]
    Forbidden,

    #[error("conflict: {0}")]
    Conflict(String),

    #[error("too many requests, try again in a few seconds")]
    TooManyRequests,

    #[error("internal server error")]
    Internal(String),
}

/// Lets repositories use `?` on database calls. The detail is logged, never sent to clients.
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        Self::Internal(err.to_string())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = match &self {
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::TooManyRequests => StatusCode::TOO_MANY_REQUESTS,
            Self::Conflict(_) => StatusCode::CONFLICT,
            Self::Internal(detail) => {
                // Log the real cause; never leak it to the client.
                tracing::error!(%detail, "internal error");
                StatusCode::INTERNAL_SERVER_ERROR
            }
        };

        (status, Json(json!({ "error": self.to_string() }))).into_response()
    }
}
