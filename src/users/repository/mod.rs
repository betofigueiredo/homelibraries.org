mod in_memory;
mod sqlite;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
pub use in_memory::{InMemorySessionRepository, InMemoryUserRepository};
pub use sqlite::{SqliteSessionRepository, SqliteUserRepository};

use super::model::{LoginToken, Session, User, UserId};
use crate::error::AppError;

/// Persistence port for users.
#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn get(&self, id: UserId) -> Result<Option<User>, AppError>;
    /// `email` must already be normalized (see `validate_email`).
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError>;
    async fn find_by_username(&self, username: &str) -> Result<Option<User>, AppError>;
    /// `Conflict` if the email is already used.
    async fn insert(&self, user: &User) -> Result<(), AppError>;
    /// Replaces the stored user with the same id. `Conflict` if the username is taken.
    async fn update(&self, user: &User) -> Result<(), AppError>;
}

/// Persistence port for the secrets that sign people in: pending sign-in links and sessions.
/// Both are looked up by the hash of their secret, never by the secret itself.
#[async_trait]
pub trait SessionRepository: Send + Sync {
    async fn insert_login_token(&self, token: &LoginToken) -> Result<(), AppError>;
    /// Removes the token and returns its email, or `None` if it is unknown or expired.
    /// Removing it makes every link single use.
    async fn take_login_token(
        &self,
        token_hash: &str,
        now: DateTime<Utc>,
    ) -> Result<Option<String>, AppError>;
    async fn insert_session(&self, session: &Session) -> Result<(), AppError>;
    /// The signed-in user, or `None` if the session is unknown or expired.
    async fn find_session(
        &self,
        id_hash: &str,
        now: DateTime<Utc>,
    ) -> Result<Option<UserId>, AppError>;
    /// Does nothing if there is no such session.
    async fn delete_session(&self, id_hash: &str) -> Result<(), AppError>;
}
