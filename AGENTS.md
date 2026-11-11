# Architecture rules

- Remote agent access uses the app-hosted MCP server with OAuth caller identity and user-scoped database clients; record access and mutations must rely on existing role checks and RLS, never privileged-key bypasses, and protected role assignments stay excluded.