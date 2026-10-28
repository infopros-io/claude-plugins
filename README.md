# InfoPros plugins for Claude

Plugins that connect Claude to InfoPros OS. They work only for members of the InfoPros team: every tool asks you to sign in with your InfoPros OS account.

## infopros-os

Edit talking-head videos into finished vertical reels, change them in plain words, and share them. Find the best
short-form highlights in a long video, from a YouTube link or a file, and make them into reels, a landscape video
framed for vertical shot by shot. It adds:

- **The InfoPros OS tools** (MCP server at `https://mcp.infopros.app/mcp`): upload links, Google Drive imports, reel status, previews, changes, going back to a version, share links, highlight searches, and reels made from highlights.
- **A reel-editing skill and a highlights skill** that tell Claude how to use them for people who are not technical.

The first time Claude uses a tool, it opens the InfoPros OS sign-in in your browser.

**Highlights from a YouTube link:** use Claude Code or the Code tab in Claude Desktop. YouTube doesn't let our server
download videos, so Claude downloads the video on your computer and sends it to InfoPros OS (the first time, it
installs a free downloader). In a chat or on your phone, Claude tells you how to do it from the Code tab.

### Install

Every way ends the same: the first time Claude uses an InfoPros OS tool, your browser opens the InfoPros OS sign-in.
Sign in with your InfoPros account, and you are connected.

#### Claude Desktop (chat and Cowork): a few clicks

A prompt can't install plugins here, because Claude can't change its own app settings. It takes four clicks:

1. Open **Customize** in the sidebar, then **Plugins**.
2. Select **Add marketplace** and enter `infopros-io/claude-plugins`.
3. Find **infopros-os** and select **Install**.
4. Open the plugin's **Connectors** tab and select **Connect** next to `infopros-os`. Sign in with your InfoPros OS account.

The plugin is saved to your Claude account, so it also works in chat and in Claude Code. If your organization already
added it, it is under Customize > Plugins and you only need step 4.

#### Claude Code, or the Code tab in Claude Desktop: paste a prompt

Paste this into Claude Code:

```text
Install the InfoPros OS plugin for me. Run these two commands:
claude plugin marketplace add infopros-io/claude-plugins
claude plugin install infopros-os@infopros
Then tell me to restart Claude Code, and after that to type /mcp, pick infopros-os and sign in with my InfoPros account.
```

Or type the commands yourself:

```
/plugin marketplace add infopros-io/claude-plugins
/plugin install infopros-os@infopros
```

Restart Claude Code, type `/mcp`, pick `infopros-os` and sign in.

#### Codex: paste a prompt

Codex gets the tools without the skill. Paste this into Codex:

```text
Connect me to InfoPros OS. Run:
codex mcp add infopros-os --url https://mcp.infopros.app/mcp
codex mcp login infopros-os
The second command opens my browser to sign in with my InfoPros account.
```

#### Other assistants (tools only, no skill)

- **ChatGPT:** add a connector with `https://mcp.infopros.app/mcp`.
- **Claude without the plugin:** Settings > Connectors > Add custom connector, with the same address.

### Check it works

Ask: "Show me my latest reels from InfoPros OS." Claude should list them.

### Updating

- **Tools:** they update by themselves whenever InfoPros OS is deployed.
- **The skill:** a new version is published by raising `version` in `plugins/infopros-os/.claude-plugin/plugin.json`. Each person then updates the plugin:
  - Claude Code: `/plugin update infopros-os@infopros`
  - Claude Desktop and Cowork: the Update button on the plugin
