use std::{
    net::{IpAddr, SocketAddr},
    sync::Arc,
};

use api::{
    mailer::{LogMailer, Mailer, ResendMailer},
    state::AppState,
};
use tokio::net::TcpListener;
use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "api=debug,tower_http=debug,info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3000);
    // Localhost only by default; in production nginx is in front.
    // Set HOST=0.0.0.0 to reach it from other machines on your network.
    let host: IpAddr = std::env::var("HOST")
        .ok()
        .and_then(|h| h.parse().ok())
        .unwrap_or(IpAddr::from([127, 0, 0, 1]));
    let addr = SocketAddr::from((host, port));

    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://library.db".into());
    // Where people reach the app; used in sign-in links. In production nginx is in front.
    let public_url =
        std::env::var("PUBLIC_URL").unwrap_or_else(|_| format!("http://localhost:{port}"));
    let mailer = mailer()?;
    let state = AppState::sqlite(&database_url, mailer, &public_url).await?;
    tracing::info!("using database {database_url}, public URL {public_url}");

    let listener = TcpListener::bind(addr).await?;
    tracing::info!("listening on {}", listener.local_addr()?);

    axum::serve(listener, api::app(state))
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

/// Emails go through Resend when `RESEND_API_KEY` is set (then `MAIL_FROM` is required).
/// Without it, sign-in links are only written to the log: fine for development.
fn mailer() -> Result<Arc<dyn Mailer>, Box<dyn std::error::Error>> {
    let Some(api_key) = std::env::var("RESEND_API_KEY")
        .ok()
        .filter(|key| !key.is_empty())
    else {
        tracing::warn!("RESEND_API_KEY is not set: sign-in links are logged, not emailed");
        return Ok(Arc::new(LogMailer::default()));
    };
    let from =
        std::env::var("MAIL_FROM").map_err(|_| "MAIL_FROM must be set with RESEND_API_KEY")?;
    Ok(Arc::new(ResendMailer::new(&api_key, &from)?))
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {},
        () = terminate => {},
    }

    tracing::info!("shutdown signal received");
}
