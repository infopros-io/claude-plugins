# InfoPros plugins for Claude

Plugins that connect Claude to InfoPros OS. They work only for members of the InfoPros team: every tool asks you to sign in with your InfoPros OS account.

## infopros-os

Edit talking-head videos into finished vertical reels, change them in plain words, and share them. It adds:

- **The InfoPros OS tools** (MCP server at `https://mcp.infopros.app/mcp`): upload links, Google Drive imports, reel status, previews, changes, going back to a version, and share links.
- **A reel-editing skill** that tells Claude how to use them for people who are not technical.

The first time Claude uses a tool, it opens the InfoPros OS sign-in in your browser.

### Install

- **Claude Code:**

  ```
  /plugin marketplace add infopros-io/claude-plugins
  /plugin install infopros-os@infopros
  ```

- **Claude Desktop and Cowork:**
  - **Your organization added the plugin:** it shows under Customize > Plugins.
  - **Otherwise:** add the marketplace `infopros-io/claude-plugins` under Customize > Plugins, then install `infopros-os`.
- **Only the tools, without the skill** (any assistant that supports remote MCP servers):
  - **Claude:** Settings > Connectors > Add custom connector, with `https://mcp.infopros.app/mcp`.
  - **Codex:** `codex mcp add infopros-os --url https://mcp.infopros.app/mcp`, then `codex mcp login infopros-os`.
  - **ChatGPT:** add a connector with the same address.

### Updating

- **Tools:** they update by themselves whenever InfoPros OS is deployed.
- **The skill:** a new version is published by raising `version` in `plugins/infopros-os/.claude-plugin/plugin.json`. Each person then updates the plugin:
  - Claude Code: `/plugin update infopros-os@infopros`
  - Claude Desktop and Cowork: the Update button on the plugin
