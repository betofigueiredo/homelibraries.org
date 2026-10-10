use std::sync::Arc;

use chrono::{Duration, Utc};

use crate::{
    auth::SESSION_DAYS,
    error::AppError,
    users::{
        model::{Session, User, UserId},
        repository::{SessionRepository, UserRepository},
        secret::{hash_secret, new_secret},
    },
};

/// The signed-in user and the secret for their session cookie.
pub struct SignedIn {
    pub user: User,
    pub session_secret: String,
}

pub struct VerifyLoginService {
    users: Arc<dyn UserRepository>,
    sessions: Arc<dyn SessionRepository>,
}

impl VerifyLoginService {
    pub fn new(users: Arc<dyn UserRepository>, sessions: Arc<dyn SessionRepository>) -> Self {
        Self { users, sessions }
    }

    /// Uses up the sign-in link's `token` and starts a session.
    /// The first time an email signs in, its account is created (with no username yet).
    pub async fn execute(&self, token: &str) -> Result<SignedIn, AppError> {
        let now = Utc::now();
        let email = self
            .sessions
            .take_login_token(&hash_secret(token), now)
            .await?
            .ok_or(AppError::Unauthorized)?;

        let user = if let Some(user) = self.users.find_by_email(&email).await? {
            user
        } else {
            let user = User {
                id: UserId::new(),
                email,
                username: None,
                display_name: None,
                created_at: now,
            };
            self.users.insert(&user).await?;
            user
        };

        let session_secret = new_secret();
        self.sessions
            .insert_session(&Session {
                id_hash: hash_secret(&session_secret),
                user_id: user.id,
                expires_at: now + Duration::days(SESSION_DAYS),
            })
            .await?;
        Ok(SignedIn {
            user,
            session_secret,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::users::{
        model::LoginToken,
        repository::{InMemorySessionRepository, InMemoryUserRepository},
    };

    async fn link(sessions: &InMemorySessionRepository, email: &str) -> String {
        let secret = new_secret();
        sessions
            .insert_login_token(&LoginToken {
                token_hash: hash_secret(&secret),
                email: email.into(),
                expires_at: Utc::now() + Duration::minutes(15),
            })
            .await
            .unwrap();
        secret
    }

    #[tokio::test]
    async fn first_sign_in_creates_the_user_and_later_ones_reuse_it() {
        let users = Arc::new(InMemoryUserRepository::default());
        let sessions = Arc::new(InMemorySessionRepository::default());
        let service = VerifyLoginService::new(users.clone(), sessions.clone());

        let first = service
            .execute(&link(&sessions, "ada@mail.com").await)
            .await
            .unwrap();
        let second = service
            .execute(&link(&sessions, "ada@mail.com").await)
            .await
            .unwrap();

        assert_eq!(first.user.id, second.user.id);
        assert_eq!(first.user.username, None);
        let found = sessions
            .find_session(&hash_secret(&second.session_secret), Utc::now())
            .await
            .unwrap();
        assert_eq!(found, Some(first.user.id));
    }

    #[tokio::test]
    async fn a_link_works_once() {
        let users = Arc::new(InMemoryUserRepository::default());
        let sessions = Arc::new(InMemorySessionRepository::default());
        let service = VerifyLoginService::new(users, sessions.clone());
        let token = link(&sessions, "ada@mail.com").await;

        service.execute(&token).await.unwrap();
        assert!(matches!(
            service.execute(&token).await,
            Err(AppError::Unauthorized)
        ));
        assert!(matches!(
            service.execute("made-up").await,
            Err(AppError::Unauthorized)
        ));
    }
}
