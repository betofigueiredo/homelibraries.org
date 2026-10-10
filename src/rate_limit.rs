//! Rate limit for the public read routes, per client IP.
//! Each IP gets a bucket of `BURST` requests that refills by one every `REFILL_EVERY_MS`.

use std::{net::IpAddr, sync::Arc, time::Duration};

use axum::{Router, http::Request, response::IntoResponse};
use tower_governor::{
    GovernorError, GovernorLayer, governor::GovernorConfigBuilder, key_extractor::KeyExtractor,
};

use crate::{error::AppError, state::AppState};

/// Requests a client can make at once, e.g. an agent calling several tools in a row.
pub const BURST: u32 = 30;
/// One more request is allowed every half second: 120 per minute sustained.
const REFILL_EVERY_MS: u64 = 500;

/// Identifies the client by the `X-Real-IP` header that nginx sets.
///
/// The app only listens on 127.0.0.1, so every connection comes from nginx and its own IP
/// would put all clients in one bucket. nginx overwrites `X-Real-IP` with the real address,
/// so clients can't fake it. `X-Forwarded-For` is not used: nginx appends to it, so its first
/// value is whatever the client sent.
/// Requests without the header (local ones, tests) share the 127.0.0.1 bucket.
#[derive(Clone)]
struct RealIp;

impl KeyExtractor for RealIp {
    type Key = IpAddr;

    fn extract<T>(&self, request: &Request<T>) -> Result<IpAddr, GovernorError> {
        let ip = request
            .headers()
            .get("x-real-ip")
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.parse().ok())
            .unwrap_or(IpAddr::from([127, 0, 0, 1]));
        Ok(ip)
    }
}

/// Adds the rate limit to every route in `router`.
///
/// # Panics
/// Never: the constants above are valid.
pub fn per_ip(router: Router<AppState>) -> Router<AppState> {
    let config = GovernorConfigBuilder::default()
        .key_extractor(RealIp)
        .per_millisecond(REFILL_EVERY_MS)
        .burst_size(BURST)
        .finish()
        .expect("burst and refill are not zero");

    // The limiter remembers every IP it has seen. Once a minute, forget the ones with a full
    // bucket. The thread stops when the app is dropped (the limiter is only weakly held).
    let limiter = Arc::downgrade(config.limiter());
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(Duration::from_mins(1));
            match limiter.upgrade() {
                Some(limiter) => limiter.retain_recent(),
                None => break,
            }
        }
    });

    router.layer(
        GovernorLayer::new(config)
            .error_handler(|_: GovernorError| AppError::TooManyRequests.into_response()),
    )
}
