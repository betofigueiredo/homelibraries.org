mod handler;
mod service;

pub use handler::handler;
// Reused by the MCP tools in `src/mcp/`.
pub(crate) use handler::SearchBooksRequest;
pub(crate) use service::SearchBooksService;
