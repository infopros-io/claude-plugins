# InfoPros plugins for Claude

Plugins that connect Claude to InfoPros OS. They work only for members of the InfoPros team: every tool asks you to
sign in with your InfoPros OS account.

> **To install:** open Claude on your computer, paste the link to this page
> (`https://github.com/infopros-io/claude-plugins`) and say **"install this"**. Claude walks you through it in about
> 3 minutes. Or follow [Install](#install) yourself.

## Which Claude to use

The Claude desktop app has three tabs: **Chat**, **Cowork** and **Code**. The plugin works in all of them, and once
installed it is in every one.

| Use | For |
| --- | --- |
| **Chat** (also claude.ai and your phone) | Questions about client data, recaps and the commands. Showing, changing, approving and sharing videos. Videos from a Google Drive link. Ads from creatives already in OS. |
| **Cowork** | Work with files in a folder on your computer: a folder of videos to edit, ad creatives to upload. |
| **Code** (or Claude Code in a terminal) | Everything, and the only place for: highlights from a YouTube link, very large videos, editing on your own computer when a video can't go up. Also the quickest way to install. |

When unsure, start in **Chat**. If a task needs Code, Claude says so in one line and gives you the message to paste
there.

## infopros-os

Ask about InfoPros data in plain words, edit videos and build Meta ads. It adds:

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
  welcome or thank-you), you pick which, in any look you ask for (a font, colors, a website or a reel to copy),
  changed in plain words and shared. Highlights of a long video, from a YouTube link or a file, made into reels
  framed for vertical shot by shot. Transcripts, and local editing on your own computer.
- **Meta ads:** uploads creatives from Drive or your computer and builds campaigns, ad sets and ads, named in the
  team's convention and always paused. Campaigns and ad sets are made with Meta's own ads tools, which come with the
  plugin.
- **Two connections:**
  - `infopros-os` (`https://mcp.infopros.app/mcp`): client data, video editing, ad uploads. Everyone needs it.
  - `meta-ads` (`https://mcp.facebook.com/ads`, Meta's own): campaigns and ad sets. Only for people who build ads.
- **Skills** that tell Claude how to use them for people who are not technical, and to keep answers brief.

## Install

> **Claude, if someone shared this page and asked you to install it:** follow the steps below with them right away.
> They are not technical. Start with one line, "Installing InfoPros OS: about 3 minutes." Do every step you can
> yourself; give them only the clicks you can't do, one at a time, and wait for "done". End with "All set.", naming
> anything still missing. No explanations unless asked. If the `infopros-os` tools are already there, go to step 2;
> if they are but the `meta-ads` tools aren't, update first ([Updating](#updating)).

### 1. Install the plugin

Pick the one you're in. On a phone, use a computer instead.

**Code tab, or Claude Code: one paste.** Paste this:

```text
Install the InfoPros OS plugin for me. Run:
claude plugin marketplace add infopros-io/claude-plugins
claude plugin install infopros-os@infopros
Then tell me to restart Claude Code and help me sign in.
```

If the marketplace is already added, Claude runs `claude plugin marketplace update infopros` instead of the first
command. Restart Claude Code (close and open it again), then say "continue".

**Chat or Cowork: four clicks.** Claude can't change its own app settings here, so you click:

1. Open **Customize** in the sidebar, then **Plugins**.
2. Select **Add marketplace** and enter `infopros-io/claude-plugins`.
3. Find **infopros-os** and select **Install**.

If your organization already added it, it is under Customize > Plugins and you can go to step 2.

**Codex: one paste.** Codex gets the tools, without the skills and commands. Paste this:

```text
Connect me to InfoPros OS. Run:
codex mcp add infopros-os --url https://mcp.infopros.app/mcp
codex mcp login infopros-os
If I build Meta ads, also run:
codex mcp add meta-ads --url https://mcp.facebook.com/ads
codex mcp login meta-ads
```

Each `login` opens the browser to sign in. Then go to step 4.

### 2. Sign in to InfoPros OS

- **Code:** type `/mcp`, pick **infopros-os**, and sign in with your InfoPros account in the browser.
- **Chat or Cowork:** open the plugin's **Connectors** tab and select **Connect** next to **infopros-os**.

Claude checks it with `list_clients`. If it still fails after a second try, ask whoever manages InfoPros OS.

### 3. Sign in to Meta (only if you build ads)

- **Code:** type `/mcp`, pick **meta-ads**, and sign in.
- **Chat or Cowork:** in the plugin's **Connectors** tab, select **Connect** next to **meta-ads**.

Sign in with the Facebook account that has the clients' ad accounts. When Meta asks, keep every permission checked,
including Pages and Instagram, and pick all the businesses and ad accounts you work on.

Claude checks it with `ads_get_ad_accounts`. If a client is missing, you likely used another Facebook account or
unchecked something: sign out of `meta-ads` and in again. If it's still missing, your Facebook account has no access
to that ad account; whoever runs the client's Business Manager has to add you.

### 4. Say "set me up"

Claude checks the sign-in and the one domain chats need (`mcp.infopros.app`), and in Code installs the free tools
for YouTube videos and local editing.

### Check it works

Ask: "How did our last webinar do?" or type `/recap` and pick a client. For videos: "Show me my latest reels and
videos from InfoPros OS."

### Other assistants (tools only, no skills)

- **ChatGPT:** add a connector with `https://mcp.infopros.app/mcp`.
- **Claude without the plugin:** Settings > Connectors > Add custom connector, with the same address.

## Updating

- **Tools:** they update by themselves whenever InfoPros OS is deployed.
- **The plugin:** a new version is published by raising `version` in
  `plugins/infopros-os/.claude-plugin/plugin.json`. Each person then updates it:
  - Code: `claude plugin marketplace update infopros`, then `claude plugin update infopros-os@infopros`, then restart
  - Chat and Cowork: Customize > Plugins > infopros-os > **Update**

  Then sign in to anything new it brings (steps 2 and 3).

## Problems

- **"Marketplace not found":** check the spelling `infopros-io/claude-plugins` and that you're online.
- **The sign-in page doesn't open:** copy the link Claude Code prints into the browser.
- **In a chat, Claude can't send your videos or reach `mcp.infopros.app`:** allow `mcp.infopros.app` under
  Settings > Capabilities, or say "set me up". Or do it from the Code tab.
- **YouTube links:** YouTube doesn't let our server download videos, so use the Code tab; Claude downloads it on
  your computer (the first time, it installs a free downloader).
- **Meta says the app isn't available or asks for business verification:** sign in with the Facebook account that
  is an admin or employee in the client's Business Manager.
