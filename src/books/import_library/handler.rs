use axum::{
    Json,
    extract::{Multipart, State},
};

use super::{
    formats,
    service::{ImportLibraryService, ImportSummary},
};
use crate::{auth::CurrentUser, error::AppError, state::AppState};

/// Text of the form field named `file`; other fields are ignored.
pub(super) async fn read_file_field(multipart: &mut Multipart) -> Result<String, AppError> {
    let bad_upload = |e: axum::extract::multipart::MultipartError| {
        AppError::BadRequest(format!("cannot read the upload: {e}"))
    };
    while let Some(field) = multipart.next_field().await.map_err(bad_upload)? {
        if field.name() == Some("file") {
            return field.text().await.map_err(bad_upload);
        }
    }
    Err(AppError::BadRequest(
        "send the CSV as a form field named `file`".into(),
    ))
}

/// Body: `multipart/form-data` with the export in a `file` field
/// (`curl -F file=@goodreads_library_export.csv`). The format is detected from the columns.
/// axum's default 2 MB body limit applies, room for thousands of books.
pub async fn handler(
    current: CurrentUser,
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<ImportSummary>, AppError> {
    let csv = read_file_field(&mut multipart).await?;
    let input = formats::parse(&csv)?.into_input();
    let summary = ImportLibraryService::new(state.books)
        .execute(current.user.id, input)
        .await?;
    Ok(Json(summary))
}
