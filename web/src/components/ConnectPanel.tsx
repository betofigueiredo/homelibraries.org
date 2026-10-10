import { useState } from "react";

import { mcpUrl } from "../api";
import { CopyButton } from "./CopyButton";

const CLIENTS = [
  { id: "code", label: "Claude Code" },
  { id: "web", label: "Claude.ai" },
  { id: "json", label: "Cursor / VS Code" },
] as const;

type Client = (typeof CLIENTS)[number]["id"];

function snippet(client: Client, name: string, url: string) {
  switch (client) {
    case "code":
      return `claude mcp add --transport http ${name} ${url}`;
    case "web":
      return `Settings → Connectors → Add custom connector\nName: ${name}\nURL:  ${url}`;
    case "json":
      return JSON.stringify({ mcpServers: { [name]: { type: "http", url } } }, null, 2);
  }
}

/** The library's MCP address and how to add it to each assistant. */
export function ConnectPanel({ username }: { username: string }) {
  const [client, setClient] = useState<Client>("code");
  const url = mcpUrl(username);
  const name = `${username}-library`;
  const text = snippet(client, name, url);

  return (
    <section className="connect" aria-labelledby="connect-title">
      <div className="connect-head">
        <h2 id="connect-title" className="card-title">
          Connect your AI
        </h2>
        <span className="badge">MCP</span>
      </div>
      <p className="connect-lede">Add this library to your assistant and ask about these books. Read-only.</p>
      <div className="connect-url">
        <code>{url.replace(/^https?:\/\//, "")}</code>
        <CopyButton text={url} className="connect-copy" />
      </div>
      <div className="connect-tabs" role="tablist" aria-label="Assistant">
        {CLIENTS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={client === c.id}
            aria-controls="connect-snippet"
            onClick={() => setClient(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="connect-snippet-wrap">
        <pre id="connect-snippet" role="tabpanel" aria-labelledby={`tab-${client}`}>
          {text}
        </pre>
        <CopyButton text={text} className="connect-copy connect-copy-corner" />
      </div>
    </section>
  );
}
