mod handler;
mod service;

pub use handler::handler;
// Reused by the MCP tools in `src/mcp/`.
pub(crate) use service::GetBookService;
