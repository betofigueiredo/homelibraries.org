use std::{str::FromStr, sync::Arc};

use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePool, SqliteSynchronous};

use crate::{
    books::repository::{BookRepository, InMemoryBookRepository, SqliteBookRepository},
    mailer::{LogMailer, Mailer},
    users::repository::{
        InMemorySessionRepository, InMemoryUserRepository, SessionRepository,
        SqliteSessionRepository, SqliteUserRepository, UserRepository,
    },
};

/// Shared state handed to every handler via axum's `State` extractor.
/// Holds repositories and other ports; each handler builds the one service it needs from them.
/// Cloning is cheap: it only clones `Arc`s.
#[derive(Clone)]
pub struct AppState {
    pub books: Arc<dyn BookRepository>,
    pub users: Arc<dyn UserRepository>,
    pub sessions: Arc<dyn SessionRepository>,
    pub mailer: Arc<dyn Mailer>,
    /// Where the app is reached, without a trailing slash: `https://homelibraries.org`.
    /// Used in sign-in links, the cookie's `Secure` flag and the same-origin check.
    pub public_url: Arc<str>,
}

/// Composition root: the only place that picks concrete repository implementations.
impl AppState {
    /// Used by tests; data is lost on restart. Sign-in links go to a `LogMailer`.
    #[must_use]
    pub fn in_memory() -> Self {
        Self {
            books: Arc::new(InMemoryBookRepository::default()),
            users: Arc::new(InMemoryUserRepository::default()),
            sessions: Arc::new(InMemorySessionRepository::default()),
            mailer: Arc::new(LogMailer::default()),
            public_url: "http://localhost:3000".into(),
        }
    }

    /// Replaces the mailer, e.g. with a `LogMailer` the test keeps a handle to.
    #[must_use]
    pub fn with_mailer(self, mailer: Arc<dyn Mailer>) -> Self {
        Self { mailer, ..self }
    }

    /// Opens (or creates) the `SQLite` file at `url` and applies pending migrations.
    ///
    /// # Errors
    /// Fails if the file can't be opened or a migration fails.
    pub async fn sqlite(
        url: &str,
        mailer: Arc<dyn Mailer>,
        public_url: &str,
    ) -> Result<Self, sqlx::Error> {
        let options = SqliteConnectOptions::from_str(url)?
            .create_if_missing(true)
            .foreign_keys(true)
            // WAL lets reads run during a write, and Litestream (DEPLOY.md) needs it.
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal);
        let pool = SqlitePool::connect_with(options).await?;
        sqlx::migrate!().run(&pool).await?;
        Ok(Self {
            books: Arc::new(SqliteBookRepository::new(pool.clone())),
            users: Arc::new(SqliteUserRepository::new(pool.clone())),
            sessions: Arc::new(SqliteSessionRepository::new(pool)),
            mailer,
            public_url: public_url.trim_end_matches('/').into(),
        })
    }
}
