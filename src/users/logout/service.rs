use std::sync::Arc;

use crate::{error::AppError, users::repository::SessionRepository};

pub struct LogoutService {
    sessions: Arc<dyn SessionRepository>,
}

impl LogoutService {
    pub fn new(sessions: Arc<dyn SessionRepository>) -> Self {
        Self { sessions }
    }

    /// Ends this browser's session only; other devices stay signed in.
    pub async fn execute(&self, session_hash: &str) -> Result<(), AppError> {
        self.sessions.delete_session(session_hash).await
    }
}
