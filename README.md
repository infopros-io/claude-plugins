# InfoPros plugins for Claude

Plugins that connect Claude to InfoPros OS. They work only for members of the InfoPros team: every tool asks you to sign in with your InfoPros OS account.

## infopros-os

Ask about InfoPros data in plain words, and edit videos. It adds:

- **Answers about client data,** short and with links to the source:
  - webinar numbers and recaps, compared with the last webinars
  - WebinarJam: registrants, show rate, who stayed to the offer, watch time, replays, whether a lead attended
  - Meta ads: spend, cost per registration and the rest for any period, and who changed what (budgets, pauses,
    targeting) and when
  - winning and tired creatives, and the hooks that work
  - booked calls, closes and cash posted in Slack or entered on the results form
  - launches and budgets, and what was said or decided in Slack, on calls or in the SOPs
- **Commands:**
  - `/recap`: a webinar recap, like the team's Slack recap posts
  - `/morning`: last night's webinars, bookings, cost jumps, ad changes and today's webinars
  - `/why`: why a cost or show rate moved, and what to fix first
  - `/client`: a client's status at a glance
  - `/winners`: a client's best and tired creatives
  - `/results-form`: a results form link for a client's webinar, which you share yourself

  Without a client or webinar named, the command lets you pick from the most recent ones.
- **Video editing:** talking-head videos into short-form vertical reels or long-form 16:9 page videos (sales,
  welcome or thank-you), you pick which, changed in plain words and shared. Highlights of a long video, from a
  YouTube link or a file, made into reels framed for vertical shot by shot. Transcripts, and local editing on your
  own computer.
- **The InfoPros OS tools** (MCP server at `https://mcp.infopros.app/mcp`) and **skills** that tell Claude how to
  use them for people who are not technical, and to keep answers brief.

The first time Claude uses a tool, it opens the InfoPros OS sign-in in your browser.

**Highlights from a YouTube link:** use Claude Code or the Code tab in Claude Desktop. YouTube doesn't let our server
download videos, so Claude downloads the video on your computer and sends it to InfoPros OS (the first time, it
installs a free downloader). In a chat or on your phone, Claude tells you how to do it from the Code tab.

**Videos in a chat:** the first time, Claude may ask you to allow `mcp.infopros.app` under Settings > Capabilities, so
it can send the files you drop in. Or it can do the work on your computer, from the Code tab.

### Install

Every way ends the same: the first time Claude uses an InfoPros OS tool, your browser opens the InfoPros OS sign-in.
Sign in with your InfoPros account, and you are connected.

**Then say "set me up".** Claude checks the sign-in, the one domain chats need (`mcp.infopros.app`) and, in
Claude Code or the Code tab, installs the free tools for YouTube videos and local editing.

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

Codex gets the tools and short-answer instructions, without the skills and commands. Paste this into Codex:

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

Ask: "How did our last webinar do?" or type `/recap` and pick a client. For videos, ask: "Show me my latest reels and videos from
InfoPros OS."

### Updating

- **Tools:** they update by themselves whenever InfoPros OS is deployed.
- **The skill:** a new version is published by raising `version` in `plugins/infopros-os/.claude-plugin/plugin.json`. Each person then updates the plugin:
  - Claude Code: `/plugin update infopros-os@infopros`
  - Claude Desktop and Cowork: the Update button on the plugin
