use std::collections::HashMap;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use tokio::sync::RwLock;

use super::{SessionRepository, UserRepository};
use crate::{
    error::AppError,
    users::model::{LoginToken, Session, User, UserId},
};

/// Mock persistence for tests: keeps everything in memory, lost on restart.
#[derive(Default)]
pub struct InMemoryUserRepository {
    users: RwLock<HashMap<UserId, User>>,
}

#[async_trait]
impl UserRepository for InMemoryUserRepository {
    async fn get(&self, id: UserId) -> Result<Option<User>, AppError> {
        Ok(self.users.read().await.get(&id).cloned())
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        let users = self.users.read().await;
        Ok(users.values().find(|u| u.email == email).cloned())
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<User>, AppError> {
        let users = self.users.read().await;
        Ok(users
            .values()
            .find(|u| u.username.as_deref() == Some(username))
            .cloned())
    }

    async fn insert(&self, user: &User) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if users.values().any(|u| u.email == user.email) {
            return Err(AppError::Conflict("email already used".into()));
        }
        users.insert(user.id, user.clone());
        Ok(())
    }

    async fn update(&self, user: &User) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        let taken = user.username.is_some()
            && users
                .values()
                .any(|u| u.id != user.id && u.username == user.username);
        if taken {
            return Err(AppError::Conflict("username is taken".into()));
        }
        users.insert(user.id, user.clone());
        Ok(())
    }
}

#[derive(Default)]
pub struct InMemorySessionRepository {
    login_tokens: RwLock<HashMap<String, LoginToken>>,
    sessions: RwLock<HashMap<String, Session>>,
}

#[async_trait]
impl SessionRepository for InMemorySessionRepository {
    async fn insert_login_token(&self, token: &LoginToken) -> Result<(), AppError> {
        let mut tokens = self.login_tokens.write().await;
        tokens.insert(token.token_hash.clone(), token.clone());
        Ok(())
    }

    async fn take_login_token(
        &self,
        token_hash: &str,
        now: DateTime<Utc>,
    ) -> Result<Option<String>, AppError> {
        let token = self.login_tokens.write().await.remove(token_hash);
        Ok(token.filter(|t| t.expires_at > now).map(|t| t.email))
    }

    async fn insert_session(&self, session: &Session) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        sessions.insert(session.id_hash.clone(), session.clone());
        Ok(())
    }

    async fn find_session(
        &self,
        id_hash: &str,
        now: DateTime<Utc>,
    ) -> Result<Option<UserId>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .get(id_hash)
            .filter(|s| s.expires_at > now)
            .map(|s| s.user_id))
    }

    async fn delete_session(&self, id_hash: &str) -> Result<(), AppError> {
        self.sessions.write().await.remove(id_hash);
        Ok(())
    }
}
