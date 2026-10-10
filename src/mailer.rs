//! Sends the emails the app needs: only sign-in links for now.
//! A port like the repositories: picked in `main` and injected through `AppState`.

use std::{sync::Mutex, time::Duration};

use async_trait::async_trait;
use serde::Serialize;

use crate::error::AppError;

#[async_trait]
pub trait Mailer: Send + Sync {
    async fn send_login_link(&self, to: &str, link: &str) -> Result<(), AppError>;
}

/// Development and tests: writes the link to the log instead of sending it,
/// and remembers it so tests can follow it.
#[derive(Default)]
pub struct LogMailer {
    sent: Mutex<Vec<(String, String)>>,
}

impl LogMailer {
    /// The last link sent to `to`, if any.
    ///
    /// # Panics
    /// If another thread panicked while holding the lock.
    #[must_use]
    pub fn last_link_to(&self, to: &str) -> Option<String> {
        let sent = self.sent.lock().expect("mailer lock poisoned");
        sent.iter()
            .rev()
            .find(|(email, _)| email == to)
            .map(|(_, link)| link.clone())
    }
}

#[async_trait]
impl Mailer for LogMailer {
    async fn send_login_link(&self, to: &str, link: &str) -> Result<(), AppError> {
        tracing::info!(%to, %link, "sign-in link (not emailed: RESEND_API_KEY is not set)");
        self.sent
            .lock()
            .map_err(|_| AppError::Internal("mailer lock poisoned".into()))?
            .push((to.to_owned(), link.to_owned()));
        Ok(())
    }
}

/// Production: sends through Resend's HTTP API (<https://resend.com/docs/api-reference/emails/send-email>).
/// HTTPS on port 443, so it works on servers that block outgoing SMTP.
pub struct ResendMailer {
    client: reqwest::Client,
    api_key: String,
    from: String,
    endpoint: String,
}

impl ResendMailer {
    const ENDPOINT: &str = "https://api.resend.com/emails";

    /// `api_key` is a Resend key (`re_...`) that can send; `from` is like
    /// `Home Libraries <hello@homelibraries.org>`, on a domain verified in Resend.
    ///
    /// # Errors
    /// If `from` has no address in it or the HTTP client can't be built.
    pub fn new(api_key: &str, from: &str) -> Result<Self, String> {
        if !from.contains('@') {
            return Err(format!("invalid MAIL_FROM: {from:?} has no email address"));
        }
        // reqwest leaves the TLS crypto to us; ring is the one the rest of the binary builds.
        // An error only means a provider is already installed.
        let _ = rustls::crypto::ring::default_provider().install_default();
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .map_err(|e| format!("cannot build the HTTP client: {e}"))?;
        Ok(Self {
            client,
            api_key: api_key.to_owned(),
            from: from.to_owned(),
            endpoint: Self::ENDPOINT.to_owned(),
        })
    }

    /// Sends to another URL instead of Resend's: for tests.
    #[must_use]
    pub fn with_endpoint(self, endpoint: &str) -> Self {
        Self {
            endpoint: endpoint.to_owned(),
            ..self
        }
    }
}

#[derive(Serialize)]
struct ResendEmail<'a> {
    from: &'a str,
    to: [&'a str; 1],
    subject: &'a str,
    text: String,
    html: String,
}

#[async_trait]
impl Mailer for ResendMailer {
    async fn send_login_link(&self, to: &str, link: &str) -> Result<(), AppError> {
        let email = ResendEmail {
            from: &self.from,
            to: [to],
            subject: "Your sign-in link",
            text: login_text(link),
            html: login_html(link),
        };
        let response = self
            .client
            .post(&self.endpoint)
            .bearer_auth(&self.api_key)
            .json(&email)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("cannot reach Resend: {e}")))?;
        let status = response.status();
        if status.is_success() {
            return Ok(());
        }
        // Resend explains in the body, e.g. `{"name":"validation_error","message":"The
        // homelibraries.org domain is not verified..."}`.
        let body = response.text().await.unwrap_or_default();
        Err(AppError::Internal(format!(
            "Resend refused the email ({status}): {body}"
        )))
    }
}

fn login_text(link: &str) -> String {
    format!(
        "Hi,\n\n\
         Follow this link to sign in to Home Libraries:\n\n\
         {link}\n\n\
         It works once and expires in 15 minutes. If you didn't ask for it, ignore this email.\n"
    )
}

/// The same message as `login_text`, styled like the site. Email clients ignore most CSS, so it's
/// a single inline-styled table.
fn login_html(link: &str) -> String {
    format!(
        r#"<!doctype html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border:1px solid #E6E3DC;border-radius:16px;">
<tr><td style="padding:36px 32px;font-family:'Charis SIL',Charter,'Bitstream Charter',Georgia,serif;color:#0B0F14;font-size:16px;line-height:1.6;">
<p style="margin:0 0 24px;font-size:15px;color:#16485A;font-weight:bold;">Home Libraries</p>
<h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:normal;">Your sign-in <em style="color:#16485A;">link</em></h1>
<p style="margin:0 0 28px;">Follow the button to sign in. It works once and expires in 15 minutes.</p>
<p style="margin:0 0 28px;"><a href="{link}" style="display:inline-block;background:#0B0F14;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;">Sign in</a></p>
<p style="margin:0 0 8px;font-size:14px;color:#5B6168;">Or paste this address into your browser:</p>
<p style="margin:0 0 28px;font-size:13px;word-break:break-all;"><a href="{link}" style="color:#16485A;">{link}</a></p>
<p style="margin:0;font-size:14px;color:#5B6168;">If you didn't ask for it, ignore this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
"#
    )
}
