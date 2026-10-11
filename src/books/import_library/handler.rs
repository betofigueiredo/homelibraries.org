use axum::{
    Json,
    extract::{Multipart, State},
};

use super::{
    formats,
    service::{ImportLibraryService, ImportSummary},
};
use crate::{auth::CurrentUser, error::AppError, state::AppState};

/// The form: the export in `file`, and `include_to_read=true` to import the to-read shelf too.
pub(super) struct Upload {
    pub csv: String,
    pub include_to_read: bool,
}

/// Reads the form's fields; other fields are ignored.
pub(super) async fn read_upload(multipart: &mut Multipart) -> Result<Upload, AppError> {
    let bad_upload = |e: axum::extract::multipart::MultipartError| {
        AppError::BadRequest(format!("cannot read the upload: {e}"))
    };
    let (mut csv, mut include_to_read) = (None, false);
    while let Some(field) = multipart.next_field().await.map_err(bad_upload)? {
        match field.name() {
            Some("file") => csv = Some(field.text().await.map_err(bad_upload)?),
            Some("include_to_read") => {
                include_to_read = match field.text().await.map_err(bad_upload)?.trim() {
                    "true" => true,
                    "false" => false,
                    _ => {
                        return Err(AppError::BadRequest(
                            "`include_to_read` must be `true` or `false`".into(),
                        ));
                    }
                };
            }
            _ => {}
        }
    }
    let csv = csv
        .ok_or_else(|| AppError::BadRequest("send the CSV as a form field named `file`".into()))?;
    Ok(Upload {
        csv,
        include_to_read,
    })
}

/// Body: `multipart/form-data` with the export in a `file` field
/// (`curl -F file=@goodreads_library_export.csv -F include_to_read=true`). The format is
/// detected from the columns. To-read books are left out unless `include_to_read` is `true`.
/// axum's default 2 MB body limit applies, room for thousands of books.
pub async fn handler(
    current: CurrentUser,
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<ImportSummary>, AppError> {
    let upload = read_upload(&mut multipart).await?;
    let input = formats::parse(&upload.csv)?.into_input(upload.include_to_read);
    let summary = ImportLibraryService::new(state.books)
        .execute(current.user.id, input)
        .await?;
    Ok(Json(summary))
}
