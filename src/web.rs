//! The React app (`web/`), compiled into the binary so one file serves everything.
//! It is the router's fallback: `/api`, `/{username}/mcp` and `/health` match first.
//! In debug builds `rust-embed` reads `web/dist` from disk, so `npm run build` needs no restart.

use axum::{
    http::{HeaderValue, Method, Uri, header},
    response::{IntoResponse, Response},
};
use rust_embed::RustEmbed;

use crate::error::AppError;

#[derive(RustEmbed)]
#[folder = "web/dist"]
struct Dist;

/// Vite fingerprints everything under `assets/`, so a file there never changes.
const IMMUTABLE: &str = "public, max-age=31536000, immutable";
/// `index.html` names the current assets, so browsers must check for a new one.
const NO_CACHE: &str = "no-cache";

/// Serves a built file, or `index.html` for any other page so the app's router can show it.
pub async fn handler(method: Method, uri: Uri) -> Result<Response, AppError> {
    let path = uri.path().trim_start_matches('/');
    let is_asset = path.starts_with("assets/");
    let file = Dist::get(path).filter(|_| !path.is_empty());
    // Unknown API routes and missing assets are real 404s, not the app's page.
    let is_page = matches!(method, Method::GET | Method::HEAD)
        && !path.starts_with("api/")
        && (file.is_some() || !is_asset);
    if !is_page {
        return Err(AppError::NotFound);
    }

    if let Some(file) = file {
        let cache = if is_asset { IMMUTABLE } else { NO_CACHE };
        return Ok(file_response(path, file.data.into_owned(), cache));
    }

    let index = Dist::get("index.html").ok_or_else(|| {
        AppError::Internal("web/dist/index.html is missing: run `task web:build`".into())
    })?;
    Ok(file_response(
        "index.html",
        index.data.into_owned(),
        NO_CACHE,
    ))
}

fn file_response(path: &str, body: Vec<u8>, cache: &'static str) -> Response {
    let mime = mime_guess::from_path(path).first_or_octet_stream();
    let content_type = HeaderValue::from_str(mime.as_ref())
        .unwrap_or(HeaderValue::from_static("application/octet-stream"));
    (
        [
            (header::CONTENT_TYPE, content_type),
            (header::CACHE_CONTROL, HeaderValue::from_static(cache)),
        ],
        body,
    )
        .into_response()
}
