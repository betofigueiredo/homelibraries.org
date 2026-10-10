//! Import a Goodreads or Hardcover export. `preview` only parses (the UI shows it before the
//! user confirms), so it has no service; `handler` parses the same file again and imports it.

mod formats;
mod handler;
mod preview;
mod service;

pub use handler::handler;
pub use preview::handler as preview;
