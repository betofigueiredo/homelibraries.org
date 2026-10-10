use std::sync::Arc;

use serde::Serialize;

use crate::{error::AppError, users::repository::UserRepository};

/// The public part of a user: never the email.
#[derive(Debug, Serialize)]
pub struct LibraryProfile {
    pub username: String,
    pub display_name: Option<String>,
}

pub struct GetLibraryService {
    users: Arc<dyn UserRepository>,
}

impl GetLibraryService {
    pub fn new(users: Arc<dyn UserRepository>) -> Self {
        Self { users }
    }

    pub async fn execute(&self, username: &str) -> Result<LibraryProfile, AppError> {
        let user = self
            .users
            .find_by_username(username)
            .await?
            .ok_or(AppError::NotFound)?;
        Ok(LibraryProfile {
            username: username.to_owned(),
            display_name: user.display_name,
        })
    }
}
