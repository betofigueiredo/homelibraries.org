use std::sync::Arc;

use chrono::{Duration, Utc};

use crate::{
    error::AppError,
    mailer::Mailer,
    users::{
        model::LoginToken,
        repository::SessionRepository,
        secret::{hash_secret, new_secret},
    },
};

/// How long a sign-in link works.
const LINK_MINUTES: i64 = 15;

pub struct RequestLoginLinkService {
    sessions: Arc<dyn SessionRepository>,
    mailer: Arc<dyn Mailer>,
}

impl RequestLoginLinkService {
    pub fn new(sessions: Arc<dyn SessionRepository>, mailer: Arc<dyn Mailer>) -> Self {
        Self { sessions, mailer }
    }

    /// Emails a single-use link to `{public_url}/signin/verify?token=...`.
    /// The same link signs in or signs up: the account is created when it is followed.
    /// The link opens a page that POSTs the token, so email scanners that only GET it
    /// can't use it up.
    pub async fn execute(&self, email: String, public_url: &str) -> Result<(), AppError> {
        let secret = new_secret();
        self.sessions
            .insert_login_token(&LoginToken {
                token_hash: hash_secret(&secret),
                email: email.clone(),
                expires_at: Utc::now() + Duration::minutes(LINK_MINUTES),
            })
            .await?;
        let link = format!("{public_url}/signin/verify?token={secret}");
        self.mailer.send_login_link(&email, &link).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{mailer::LogMailer, users::repository::InMemorySessionRepository};

    #[tokio::test]
    async fn emails_a_link_whose_token_is_stored_hashed() {
        let sessions = Arc::new(InMemorySessionRepository::default());
        let mailer = Arc::new(LogMailer::default());
        RequestLoginLinkService::new(sessions.clone(), mailer.clone())
            .execute("ada@mail.com".into(), "https://homelibraries.org")
            .await
            .unwrap();

        let link = mailer.last_link_to("ada@mail.com").unwrap();
        let secret = link
            .strip_prefix("https://homelibraries.org/signin/verify?token=")
            .unwrap();
        let email = sessions
            .take_login_token(&hash_secret(secret), Utc::now())
            .await
            .unwrap();
        assert_eq!(email.as_deref(), Some("ada@mail.com"));
        // The secret itself is not a key.
        assert_eq!(
            sessions.take_login_token(secret, Utc::now()).await.unwrap(),
            None
        );
    }
}
