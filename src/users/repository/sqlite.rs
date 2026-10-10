use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use super::{SessionRepository, UserRepository};
use crate::{
    error::AppError,
    users::model::{LoginToken, Session, User, UserId},
};

/// Real persistence for users. The tables are created by `migrations/`.
pub struct SqliteUserRepository {
    pool: SqlitePool,
}

impl SqliteUserRepository {
    #[must_use]
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct UserRow {
    id: String,
    email: String,
    username: Option<String>,
    display_name: Option<String>,
    created_at: DateTime<Utc>,
}

impl UserRow {
    fn into_user(self) -> Result<User, AppError> {
        Ok(User {
            id: UserId(
                Uuid::parse_str(&self.id)
                    .map_err(|_| AppError::Internal("invalid id in users table".into()))?,
            ),
            email: self.email,
            username: self.username,
            display_name: self.display_name,
            created_at: self.created_at,
        })
    }
}

/// A UNIQUE constraint failing means the email or username is already used.
fn conflict_on_duplicate(what: &'static str) -> impl Fn(sqlx::Error) -> AppError {
    move |err| match &err {
        sqlx::Error::Database(db) if db.is_unique_violation() => {
            AppError::Conflict(format!("{what} already used"))
        }
        _ => err.into(),
    }
}

#[async_trait]
impl UserRepository for SqliteUserRepository {
    async fn get(&self, id: UserId) -> Result<Option<User>, AppError> {
        let row: Option<UserRow> = sqlx::query_as("SELECT * FROM users WHERE id = ?")
            .bind(id.0.to_string())
            .fetch_optional(&self.pool)
            .await?;
        row.map(UserRow::into_user).transpose()
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        let row: Option<UserRow> = sqlx::query_as("SELECT * FROM users WHERE email = ?")
            .bind(email)
            .fetch_optional(&self.pool)
            .await?;
        row.map(UserRow::into_user).transpose()
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<User>, AppError> {
        let row: Option<UserRow> = sqlx::query_as("SELECT * FROM users WHERE username = ?")
            .bind(username)
            .fetch_optional(&self.pool)
            .await?;
        row.map(UserRow::into_user).transpose()
    }

    async fn insert(&self, user: &User) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO users (id, email, username, display_name, created_at) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(user.id.0.to_string())
        .bind(&user.email)
        .bind(&user.username)
        .bind(&user.display_name)
        .bind(user.created_at)
        .execute(&self.pool)
        .await
        .map_err(conflict_on_duplicate("email"))?;
        Ok(())
    }

    async fn update(&self, user: &User) -> Result<(), AppError> {
        sqlx::query("UPDATE users SET email = ?, username = ?, display_name = ? WHERE id = ?")
            .bind(&user.email)
            .bind(&user.username)
            .bind(&user.display_name)
            .bind(user.id.0.to_string())
            .execute(&self.pool)
            .await
            .map_err(conflict_on_duplicate("username"))?;
        Ok(())
    }
}

/// Sign-in links and sessions. Expiry times are stored as Unix seconds so SQL can compare them.
pub struct SqliteSessionRepository {
    pool: SqlitePool,
}

impl SqliteSessionRepository {
    #[must_use]
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl SessionRepository for SqliteSessionRepository {
    async fn insert_login_token(&self, token: &LoginToken) -> Result<(), AppError> {
        // Expired links are never usable again; clean them up while we're here.
        sqlx::query("DELETE FROM login_tokens WHERE expires_at <= ?")
            .bind(Utc::now().timestamp())
            .execute(&self.pool)
            .await?;
        sqlx::query("INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)")
            .bind(&token.token_hash)
            .bind(&token.email)
            .bind(token.expires_at.timestamp())
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn take_login_token(
        &self,
        token_hash: &str,
        now: DateTime<Utc>,
    ) -> Result<Option<String>, AppError> {
        // One statement, so two requests with the same link can't both get the email.
        let email: Option<(String, i64)> = sqlx::query_as(
            "DELETE FROM login_tokens WHERE token_hash = ? RETURNING email, expires_at",
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await?;
        Ok(email
            .filter(|(_, expires_at)| *expires_at > now.timestamp())
            .map(|(email, _)| email))
    }

    async fn insert_session(&self, session: &Session) -> Result<(), AppError> {
        sqlx::query("DELETE FROM sessions WHERE expires_at <= ?")
            .bind(Utc::now().timestamp())
            .execute(&self.pool)
            .await?;
        sqlx::query("INSERT INTO sessions (id_hash, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(&session.id_hash)
            .bind(session.user_id.0.to_string())
            .bind(session.expires_at.timestamp())
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn find_session(
        &self,
        id_hash: &str,
        now: DateTime<Utc>,
    ) -> Result<Option<UserId>, AppError> {
        let user_id: Option<(String,)> =
            sqlx::query_as("SELECT user_id FROM sessions WHERE id_hash = ? AND expires_at > ?")
                .bind(id_hash)
                .bind(now.timestamp())
                .fetch_optional(&self.pool)
                .await?;
        user_id
            .map(|(id,)| {
                Uuid::parse_str(&id)
                    .map(UserId)
                    .map_err(|_| AppError::Internal("invalid user_id in sessions table".into()))
            })
            .transpose()
    }

    async fn delete_session(&self, id_hash: &str) -> Result<(), AppError> {
        sqlx::query("DELETE FROM sessions WHERE id_hash = ?")
            .bind(id_hash)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use chrono::{Duration, SubsecRound};

    use super::*;

    async fn pool() -> SqlitePool {
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!().run(&pool).await.unwrap();
        pool
    }

    fn user(email: &str) -> User {
        User {
            id: UserId::new(),
            email: email.into(),
            username: None,
            display_name: None,
            created_at: Utc::now().trunc_subsecs(0),
        }
    }

    #[tokio::test]
    async fn users_round_trip_and_stay_unique() {
        let repo = SqliteUserRepository::new(pool().await);
        let mut ada = user("ada@mail.com");
        repo.insert(&ada).await.unwrap();
        assert_eq!(
            repo.find_by_email("ada@mail.com").await.unwrap(),
            Some(ada.clone())
        );
        assert!(matches!(
            repo.insert(&user("ada@mail.com")).await,
            Err(AppError::Conflict(_))
        ));

        ada.username = Some("ada".into());
        repo.update(&ada).await.unwrap();
        assert_eq!(
            repo.find_by_username("ada").await.unwrap(),
            Some(ada.clone())
        );
        assert_eq!(repo.get(ada.id).await.unwrap(), Some(ada));

        let mut grace = user("grace@mail.com");
        repo.insert(&grace).await.unwrap();
        grace.username = Some("ada".into());
        assert!(matches!(
            repo.update(&grace).await,
            Err(AppError::Conflict(_))
        ));
    }

    #[tokio::test]
    async fn login_tokens_are_single_use_and_expire() {
        let pool = pool().await;
        let repo = SqliteSessionRepository::new(pool);
        let now = Utc::now();
        let token = |hash: &str, expires_at| LoginToken {
            token_hash: hash.into(),
            email: "ada@mail.com".into(),
            expires_at,
        };
        repo.insert_login_token(&token("fresh", now + Duration::minutes(15)))
            .await
            .unwrap();
        repo.insert_login_token(&token("old", now + Duration::seconds(1)))
            .await
            .unwrap();

        assert_eq!(
            repo.take_login_token("fresh", now)
                .await
                .unwrap()
                .as_deref(),
            Some("ada@mail.com")
        );
        assert_eq!(repo.take_login_token("fresh", now).await.unwrap(), None);
        let later = now + Duration::minutes(1);
        assert_eq!(repo.take_login_token("old", later).await.unwrap(), None);
    }

    #[tokio::test]
    async fn sessions_find_their_user_until_deleted_or_expired() {
        let pool = pool().await;
        let ada = user("ada@mail.com");
        SqliteUserRepository::new(pool.clone())
            .insert(&ada)
            .await
            .unwrap();
        let repo = SqliteSessionRepository::new(pool);
        let now = Utc::now();
        repo.insert_session(&Session {
            id_hash: "s1".into(),
            user_id: ada.id,
            expires_at: now + Duration::days(30),
        })
        .await
        .unwrap();

        assert_eq!(repo.find_session("s1", now).await.unwrap(), Some(ada.id));
        let expired = now + Duration::days(31);
        assert_eq!(repo.find_session("s1", expired).await.unwrap(), None);
        repo.delete_session("s1").await.unwrap();
        assert_eq!(repo.find_session("s1", now).await.unwrap(), None);
    }
}
